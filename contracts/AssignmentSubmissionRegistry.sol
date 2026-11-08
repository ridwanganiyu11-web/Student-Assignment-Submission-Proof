// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AssignmentSubmissionRegistry
 * @dev Smart contract for SubmitProof on Botchain Testnet (Chain ID 968).
 * Enables cryptographic timestamping and verification of assignment file fingerprints (SHA-256).
 * Supports both Open Submissions and Lecturer-Created Assignments (Option C).
 */
contract AssignmentSubmissionRegistry {
    struct Assignment {
        uint256 id;
        address lecturer;
        string title;
        string courseCode;
        string description;
        uint256 deadline;
        uint256 createdAt;
        bool isActive;
    }

    struct Submission {
        uint256 id;
        address student;
        bytes32 fileHash;
        string title;
        string courseCode;
        uint256 timestamp;
        uint256 assignmentId; // 0 if open submission
        uint256 statedDeadline; // 0 if not specified
        uint256 previousVersionId; // 0 if first version
        uint256 version;
    }

    uint256 private _assignmentCounter;
    uint256 private _submissionCounter;

    mapping(uint256 => Assignment) private _assignments;
    mapping(uint256 => Submission) private _submissions;

    // Track hash to all matching submission IDs
    mapping(bytes32 => uint256[]) private _hashToSubmissionIds;
    // Track submissions per student
    mapping(address => uint256[]) private _studentSubmissionIds;
    // Track submissions per lecturer assignment
    mapping(uint256 => uint256[]) private _assignmentSubmissionIds;
    // Track lecturer created assignments
    mapping(address => uint256[]) private _lecturerAssignmentIds;

    event AssignmentCreated(
        uint256 indexed assignmentId,
        address indexed lecturer,
        string title,
        string courseCode,
        uint256 deadline
    );

    event SubmissionRegistered(
        uint256 indexed submissionId,
        address indexed student,
        bytes32 indexed fileHash,
        uint256 assignmentId,
        uint256 version,
        uint256 timestamp
    );

    /**
     * @notice Lecturer creates an official assignment with a deadline.
     */
    function createAssignment(
        string calldata title,
        string calldata courseCode,
        string calldata description,
        uint256 deadline
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title is required");
        require(bytes(courseCode).length > 0, "Course code is required");
        require(deadline > block.timestamp, "Deadline must be in the future");

        _assignmentCounter++;
        uint256 newId = _assignmentCounter;

        _assignments[newId] = Assignment({
            id: newId,
            lecturer: msg.sender,
            title: title,
            courseCode: courseCode,
            description: description,
            deadline: deadline,
            createdAt: block.timestamp,
            isActive: true
        });

        _lecturerAssignmentIds[msg.sender].push(newId);

        emit AssignmentCreated(newId, msg.sender, title, courseCode, deadline);
        return newId;
    }

    /**
     * @notice Student registers an open assignment submission (self-managed).
     */
    function registerOpenSubmission(
        string calldata title,
        string calldata courseCode,
        bytes32 fileHash,
        uint256 statedDeadline,
        uint256 previousVersionId
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title is required");
        require(bytes(courseCode).length > 0, "Course code is required");
        require(fileHash != bytes32(0), "Invalid file hash");

        uint256 version = 1;
        if (previousVersionId > 0) {
            require(previousVersionId <= _submissionCounter, "Previous version does not exist");
            require(_submissions[previousVersionId].student == msg.sender, "Must own previous version");
            version = _submissions[previousVersionId].version + 1;
        }

        _submissionCounter++;
        uint256 newId = _submissionCounter;

        _submissions[newId] = Submission({
            id: newId,
            student: msg.sender,
            fileHash: fileHash,
            title: title,
            courseCode: courseCode,
            timestamp: block.timestamp,
            assignmentId: 0,
            statedDeadline: statedDeadline,
            previousVersionId: previousVersionId,
            version: version
        });

        _hashToSubmissionIds[fileHash].push(newId);
        _studentSubmissionIds[msg.sender].push(newId);

        emit SubmissionRegistered(newId, msg.sender, fileHash, 0, version, block.timestamp);
        return newId;
    }

    /**
     * @notice Student registers a submission against a lecturer-created assignment.
     */
    function registerAssignmentSubmission(
        uint256 assignmentId,
        bytes32 fileHash,
        uint256 previousVersionId
    ) external returns (uint256) {
        require(assignmentId > 0 && assignmentId <= _assignmentCounter, "Assignment does not exist");
        Assignment memory target = _assignments[assignmentId];
        require(target.isActive, "Assignment is not active");
        require(fileHash != bytes32(0), "Invalid file hash");

        uint256 version = 1;
        if (previousVersionId > 0) {
            require(previousVersionId <= _submissionCounter, "Previous version does not exist");
            require(_submissions[previousVersionId].student == msg.sender, "Must own previous version");
            require(_submissions[previousVersionId].assignmentId == assignmentId, "Previous version assignment mismatch");
            version = _submissions[previousVersionId].version + 1;
        }

        _submissionCounter++;
        uint256 newId = _submissionCounter;

        _submissions[newId] = Submission({
            id: newId,
            student: msg.sender,
            fileHash: fileHash,
            title: target.title,
            courseCode: target.courseCode,
            timestamp: block.timestamp,
            assignmentId: assignmentId,
            statedDeadline: target.deadline,
            previousVersionId: previousVersionId,
            version: version
        });

        _hashToSubmissionIds[fileHash].push(newId);
        _studentSubmissionIds[msg.sender].push(newId);
        _assignmentSubmissionIds[assignmentId].push(newId);

        emit SubmissionRegistered(newId, msg.sender, fileHash, assignmentId, version, block.timestamp);
        return newId;
    }

    // --- Read/Verification Functions (No Gas) ---

    function getSubmission(uint256 submissionId) external view returns (Submission memory) {
        require(submissionId > 0 && submissionId <= _submissionCounter, "Submission not found");
        return _submissions[submissionId];
    }

    function getAssignment(uint256 assignmentId) external view returns (Assignment memory) {
        require(assignmentId > 0 && assignmentId <= _assignmentCounter, "Assignment not found");
        return _assignments[assignmentId];
    }

    function verifySubmission(uint256 submissionId, bytes32 fileHash)
        external
        view
        returns (
            bool isMatch,
            Submission memory submission,
            bool isLate
        )
    {
        require(submissionId > 0 && submissionId <= _submissionCounter, "Submission not found");
        Submission memory sub = _submissions[submissionId];
        bool matchSuccess = (sub.fileHash == fileHash);
        bool late = false;
        if (sub.statedDeadline > 0 && sub.timestamp > sub.statedDeadline) {
            late = true;
        }
        return (matchSuccess, sub, late);
    }

    function getLatestSubmissionByHash(bytes32 fileHash)
        external
        view
        returns (bool found, Submission memory submission)
    {
        uint256[] memory ids = _hashToSubmissionIds[fileHash];
        if (ids.length == 0) {
            return (false, _submissions[0]);
        }
        uint256 latestId = ids[ids.length - 1];
        return (true, _submissions[latestId]);
    }

    function getStudentSubmissions(address student) external view returns (Submission[] memory) {
        uint256[] memory ids = _studentSubmissionIds[student];
        Submission[] memory result = new Submission[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _submissions[ids[i]];
        }
        return result;
    }

    function getAssignmentSubmissions(uint256 assignmentId) external view returns (Submission[] memory) {
        uint256[] memory ids = _assignmentSubmissionIds[assignmentId];
        Submission[] memory result = new Submission[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _submissions[ids[i]];
        }
        return result;
    }

    function getLecturerAssignments(address lecturer) external view returns (Assignment[] memory) {
        uint256[] memory ids = _lecturerAssignmentIds[lecturer];
        Assignment[] memory result = new Assignment[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = _assignments[ids[i]];
        }
        return result;
    }

    function getAllAssignments() external view returns (Assignment[] memory) {
        Assignment[] memory result = new Assignment[](_assignmentCounter);
        for (uint256 i = 1; i <= _assignmentCounter; i++) {
            result[i - 1] = _assignments[i];
        }
        return result;
    }

    function getCounts() external view returns (uint256 totalSubmissions, uint256 totalAssignments) {
        return (_submissionCounter, _assignmentCounter);
    }
}

