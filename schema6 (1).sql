    CREATE TABLE Users (
        user_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type ENUM('Student', 'Mentor', 'Admin') NOT NULL,
        gender ENUM('Male', 'Female') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_users PRIMARY KEY (user_id)
    );

    CREATE TABLE Students (
        student_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        dob DATE NOT NULL,
        graduation_year YEAR NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_students PRIMARY KEY (student_id),
        CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE Mentors (
        mentor_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        bio TEXT NOT NULL,
        social_link VARCHAR(255),
        image_url LONGBLOB NOT NULL,
        organization VARCHAR(255),
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_mentors PRIMARY KEY (mentor_id),
        CONSTRAINT fk_mentors_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );
    
    
--     table mentor_level{
--         id
--         mentor_id
--        star_count 
--     }

-- export type mentorleveltype =
--   | "beginner guide"
--   | "uplifter"
--   | "pathfinder"
--   | "illuminator"
--   | "trailblazer"
--   | "master of art";
--   | "grandmaster"



-- review -> TEXT
-- star -> number
-- table mentor_stars{
--     id 
--     mentor_id(fk)
--     star:(1-5)
--     student_id(fk)
-- }


    CREATE TABLE Mentor_Approval_History (
        history_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        mentor_id CHAR(36) NOT NULL,
        admin_id CHAR(36) NOT NULL,
        action ENUM('Approved', 'Rejected') NOT NULL,
        action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_approval_history PRIMARY KEY (history_id),
        CONSTRAINT fk_approval_history_mentor FOREIGN KEY (mentor_id) REFERENCES Mentors(mentor_id) ON DELETE CASCADE,
        CONSTRAINT fk_approval_history_admin FOREIGN KEY (admin_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE Interests (
        interest_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        interest_name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_interests PRIMARY KEY (interest_id)
    );

    CREATE TABLE User_Interests (
        user_id CHAR(36) NOT NULL,
        interest_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_user_interests PRIMARY KEY (user_id, interest_id),
        CONSTRAINT fk_user_interests_user FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        CONSTRAINT fk_user_interests_interest FOREIGN KEY (interest_id) REFERENCES Interests(interest_id) ON DELETE CASCADE
    );


------------------------------------------------------------------------------------
    CREATE TABLE Sessions (
        session_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        mentor_id CHAR(36) NOT NULL,
        session_title VARCHAR(100) NOT NULL, 
        duration_mins INT NOT NULL, 
        price DECIMAL(10,2) NOT NULL, 
        medium ENUM('Online', 'Offline') NOT NULL, 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        -- type(new)
        -- description (new)
        CONSTRAINT pk_sessions PRIMARY KEY (session_id),
        CONSTRAINT fk_sessions_mentor FOREIGN KEY (mentor_id) REFERENCES Mentors(mentor_id) ON DELETE CASCADE,
        CONSTRAINT chk_positive_duration CHECK (duration_mins > 0),
        CONSTRAINT chk_positive_price CHECK (price >= 0)
    );
    
    
--     table SesssionsType{
--        id,
--        session_id(fk),
--        session_type : SesssionsType
--     }
    
-- export type SessionType =
--   | "Course Topic Tution"
--   | "Project Help"
--   | "Career Guidance"
--   | "Competition Prep"
--   | "Productivity"
--   | "ECA";
    


    CREATE TABLE Mentor_Availability (
        availability_id CHAR(36) DEFAULT (UUID()) NOT NULL,
    
        -- session_id CHAR(36) NOT NULL,(delete)
        -- available_date DATE NOT NULL,(delete)
        --
        -- newwwwwwww
        -- mentorID(fk)
        -- start_time
        -- end_time
        -- medium(online/offline)
        -- meeting_link/ place
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_mentor_availability PRIMARY KEY (availability_id),
        CONSTRAINT fk_mentor_availability_session FOREIGN KEY (session_id) REFERENCES Sessions(session_id) ON DELETE CASCADE,
        CONSTRAINT uq_mentor_availability UNIQUE (session_id, available_date)
    );
    
    -- table booked_sessions{
    --     id:
    --     availability_id  (fk)
    --     student_id(fk)
    --     session_id(fk)
    -- }
    

    
    

    -- CREATE TABLE Availability_Details (
    --     detail_id CHAR(36) DEFAULT (UUID()) NOT NULL,
    --     availability_id CHAR(36) NOT NULL,
    --     start_time TIME NOT NULL,
    --     meeting_link VARCHAR(255) NULL,
    --     offline_address VARCHAR(255) NULL,
    --     status ENUM('Available', 'Booked', 'Cancelled') DEFAULT 'Available',
    --     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    --     CONSTRAINT pk_availability_details PRIMARY KEY (detail_id),
    --     CONSTRAINT fk_availability_details_availability FOREIGN KEY (availability_id) REFERENCES Mentor_Availability(availability_id) ON DELETE CASCADE,
    --     CONSTRAINT uq_meeting_link UNIQUE (meeting_link), 
    --     CONSTRAINT uq_availability_time UNIQUE (availability_id, start_time) 
    -- );
    -----------------------------------------------------------------------------------------------

    CREATE TABLE One_On_One_Sessions (
        one_on_one_session_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        availability_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_one_on_one_sessions PRIMARY KEY (one_on_one_session_id),
        CONSTRAINT fk_one_on_one_sessions_availability FOREIGN KEY (availability_id) REFERENCES Mentor_Availability(availability_id) ON DELETE CASCADE,
        CONSTRAINT fk_one_on_one_sessions_student FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE,
        CONSTRAINT fk_rescheduled_to FOREIGN KEY (rescheduled_to) REFERENCES Mentor_Availability(availability_id) ON DELETE SET NULL,
        CONSTRAINT uq_one_on_one_sessions UNIQUE (availability_id, student_id)
    );

    CREATE TABLE One_On_One_Messages (
        message_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        sender_id CHAR(36) NOT NULL,
        receiver_id CHAR(36) NOT NULL,
        message_text TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        CONSTRAINT pk_one_on_one_messages PRIMARY KEY (message_id),
        CONSTRAINT fk_one_on_one_messages_sender FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        CONSTRAINT fk_one_on_one_messages_receiver FOREIGN KEY (receiver_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE One_On_One_Reviews (
        review_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        one_on_one_session_id CHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_one_on_one_reviews PRIMARY KEY (review_id),
        CONSTRAINT fk_one_on_one_reviews_session FOREIGN KEY (one_on_one_session_id) REFERENCES One_On_One_Sessions(one_on_one_session_id) ON DELETE CASCADE,
        CONSTRAINT uq_one_on_one_reviews UNIQUE (one_on_one_session_id)
    );

    CREATE TABLE Payments (
        payment_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        one_on_one_session_id CHAR(36) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
        transaction_id VARCHAR(255) UNIQUE NULL,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_payments PRIMARY KEY (payment_id),
        CONSTRAINT fk_payments_session FOREIGN KEY (one_on_one_session_id) REFERENCES One_On_One_Sessions(one_on_one_session_id) ON DELETE CASCADE,
        CONSTRAINT chk_positive_amount CHECK (amount > 0)
    );












    CREATE TABLE Group_Sessions (
        group_session_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        mentor_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        session_date DATETIME NOT NULL,
        duration_mins INT NOT NULL,
        max_participants INT NOT NULL,
        platform VARCHAR(255) NOT NULL,
        status ENUM('Upcoming', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_group_sessions PRIMARY KEY (group_session_id),
        CONSTRAINT fk_group_sessions_mentor FOREIGN KEY (mentor_id) REFERENCES Mentors(mentor_id) ON DELETE CASCADE,
        CONSTRAINT chk_max_participants CHECK (max_participants > 0)
    );

    CREATE TABLE Group_Session_Participants (
        group_session_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_group_session_participants PRIMARY KEY (group_session_id, student_id),
        CONSTRAINT fk_group_session_participants_session FOREIGN KEY (group_session_id) REFERENCES Group_Sessions(group_session_id) ON DELETE CASCADE,
        CONSTRAINT fk_group_session_participants_student FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
    );

    CREATE TABLE Group_Messages (
        message_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        group_session_id CHAR(36) NOT NULL,
        sender_id CHAR(36) NOT NULL,
        message_text TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_group_messages PRIMARY KEY (message_id),
        CONSTRAINT fk_group_messages_session FOREIGN KEY (group_session_id) REFERENCES Group_Sessions(group_session_id) ON DELETE CASCADE,
        CONSTRAINT fk_group_messages_sender FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE Group_Reviews (
        review_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        group_session_id CHAR(36) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_group_reviews PRIMARY KEY (review_id),
        CONSTRAINT fk_group_reviews_session FOREIGN KEY (group_session_id) REFERENCES Group_Sessions(group_session_id) ON DELETE CASCADE,
        CONSTRAINT uq_group_reviews UNIQUE (group_session_id)
    );

    CREATE TABLE Waitlist (
        waitlist_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        mentor_id CHAR(36) NOT NULL,
        student_id CHAR(36) NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_waitlist PRIMARY KEY (mentor_id, student_id),
        CONSTRAINT fk_waitlist_mentor FOREIGN KEY (mentor_id) REFERENCES Mentors(mentor_id) ON DELETE CASCADE,
        CONSTRAINT fk_waitlist_student FOREIGN KEY (student_id) REFERENCES Students(student_id) ON DELETE CASCADE
    );

    CREATE TABLE Job_Postings (
        job_id CHAR(36) DEFAULT (UUID()) NOT NULL,
        mentor_id CHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_job_postings PRIMARY KEY (job_id),
        CONSTRAINT fk_job_postings_mentor FOREIGN KEY (mentor_id) REFERENCES Mentors(mentor_id) ON DELETE CASCADE
    );