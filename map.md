Role Based Permissions

Each workspace member has a role.
OWNER
ADMIN
MEMBER
| Action           | Owner | Admin | Member |
| ---------------- | ----- | ----- | ------ |
| delete workspace | yes   | no    | no     |
| invite member    | yes   | yes   | no     |
| create project   | yes   | yes   | yes    |
| delete project   | yes   | yes   | no     |
| create task      | yes   | yes   | yes    |

-----------
Activity Logging System

Every action creates an event.

Rahul created project "Backend API"

Rahul created task "Fix login bug"

Ankit moved task to DONE

-----------
Notification System

When something happens:

Task assigned
Comment added
Task status changed

A notification is created:

notifications table

Later we can upgrade to real-time websockets.

------------
| Package      | Purpose           |
| ------------ | ----------------- |
| pg           | PostgreSQL driver |
| drizzle-orm  | database ORM      |
| drizzle-kit  | migrations        |
| bcrypt       | password hashing  |
| jsonwebtoken | authentication    |
| dotenv       | env variables     |
