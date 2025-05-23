This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).


**Team Name:** IAM tired
**Members:**
- Abdelrahman Samir
- Omar Sherif 
- Abdelrahman Shaker
- Mariam Hassan
- Youssef Khaled
- John Wasfy
---
# Architecture Diagram:

![System Architecture](https://www.mermaidchart.com/raw/fba8efad-dcd9-4820-bb2f-06c5667ca443?theme=light&version=v0.1&format=svg)


---
---
# Overview
The system is designed to manage tasks efficiently with the following core
functionalities:
- **User Authentication and Management**
- **Task Management** (Create, update, delete tasks)
- **File Attachments** (File storage and management)
- **Notifications** (Send notifications for task updates)
- **Asynchronous Processing** (Handle background jobs)
---
---
# Flow of Operation

### 1. User Authentication:
- Users access the system through a web client and either sign up or log in using AWS **Cognito** for authentication.
### 2. Task Creation:
- After successful authentication, users can create tasks. Task data is sent through **API Gateway**, which triggers a Lambda function to process and store the task. 
- Structured and unstructured data is saved in **RDS** and **DynamoDB**, respectively. Any attached files are uploaded to Amazon **S3** for storage.
### 3. Notifications:
- When a task is updated, Amazon **SQS** manages asynchronous messaging to trigger email notifications.
- Amazon **SES** (Simple Email Service) is used to send these emails, keeping users informed of any changes in task status.
### 4. Asynchronous Processing:
- Non-blocking operations, such as email notifications, are processed using SQS queues, ensuring the main task flow remains responsive and efficient.
### 5. Monitoring:
- Amazon **CloudWatch** monitors all system components, tracking performance and system health. Dashboards and alerts notify the team of any issues, such as errors or degraded performance.
---
---
# AWS Deployment and Infrastructure Setup Guide
## **Section 1: Developer Setup**
### **1. Prerequisites**
- **AWS CLI**  
    Install and configure using your AWS credentials.  
    [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
- **Node.js**  
    Required for running the frontend (built with Next.js).  
    [Download Node.js](https://nodejs.org/)
- **Python 3.6+**  
    Required for backend scripting and tooling.  
- **Git**  
	Used to clone the project repository.

### **2. Clone the Repository**
Clone the project to your local machine:
```
git clone https://github.com/Omarsherif-11/cloud
cd cloud
```

### **3. Install Frontend Dependencies**
Navigate to the frontend directory and install the required packages:
```
cd frontend
npm install
```
To run locally for testing:
```
npm run dev
```

### **4. Prepare Backend Dependencies**
For the backend scripts (e.g., for managing tasks, Lambda packaging, etc.), set up your environment:
    - open Linux environment
    ```
    pip install pymysql
    ```
    - upload to Lambda function

----
## **Section 2: AWS Infrastructure Setup**
The application uses a range of AWS services to handle tasks, authentication, storage, background jobs, and more. Below is a step-by-step guide to setting up each required service **manually via the AWS Console or AWS CLI**.

### **Step 1: VPC and Networking**

#### **1.1 Create a VPC**
- CIDR block: `10.0.0.0/16`
- Enable DNS hostnames and DNS support
#### **1.2 Create Subnets**
- 2 **Public subnets** (`eu-north-1a`, `eu-north-1b`)
- 2 **Private subnets** in the same AZs
#### **1.3 Internet Gateway**
- Create and attach an **Internet Gateway** to the VPC
- Associate it with the **Route Table** for public subnets
#### **1.4 Route Tables**
- Public subnets: Add a route to `0.0.0.0/0` via the Internet Gateway
- Private subnets: Default route (internal communication)

---
### **Step 2: Security Groups**
Create the following security groups:
- **Frontend SG**: Allow inbound HTTP/HTTPS (80/443), allow traffic to backend
- **Backend SG**: Allow inbound from Frontend SG, Lambda, and internal services
- **Database SG**: Allow MySQL access from EC2 or Lambda SG
Example rule:
- Port: `3306` (MySQL) 
- Source: EC2 Security Group

---
### **Step 3: Compute and Storage**
#### **3.1 EC2 Instance**
- Use Amazon Linux/UNIX
- Assign a public IP
- Install any required software (Node.js, Nginx, etc.)
#### **3.2 RDS (Relational Database)**
- Choose MySQL
- Place in private subnet
- Enable automatic backups
#### **3.3 DynamoDB**
- Create a table for unstructured or NoSQL task data
- Set primary key as `task_id` 
#### **3.4 S3 Bucket**
- Store file attachments for tasks
#### **3.5 SES (Simple Email Service)**
- Verify domain or sender email
- Used to send email notifications when task updated

---
### **Step 4: Application Logic**
#### **4.1 Lambda Functions**
- Upload ZIPs containing your function logic
- Runtime: Python 3.9 
- Set timeout (10s) and memory (256MB+)
- Configure environment variables
#### **4.2 API Gateway**
- Create REST APIs to expose Lambda functions
- Enable CORS    
- Secure endpoints with Cognito (see below)

---
### **Step 5: User Authentication**
#### **5.1 Cognito**
- Create a **User Pool** for authentication
- Configure app clients (frontend, mobile, etc.)
- Enable sign-up/sign-in with email    
- Optionally create Identity Pool if you need federated access (e.g., guest users)

---


### **Step 6: Messaging and Notifications**
#### **6.1 SQS (Simple Queue Service)**
- Create a queue for handling background task updates
- Connect Lambda functions to send messages to the queue
- Use a separate Lambda to process messages asynchronously
#### **6.2 SES Integration**
- Use Lambda to send emails via SES when a message is read from the SQS queue
- Example flow: Task updated → send to SQS → trigger Lambda → send email via SES

---
### **Step 7: Monitoring and Logging**
#### **7.1 CloudWatch**
- All resources automatically log to CloudWatch
- Set up:
    - Log groups
    - Dashboards for key services (Lambda invocations, errors, queue depth)
    - Alarms (e.g., high error rates, low performance)

----

## **Section 3: Frontend Deployment (on Linux/UNIX EC2)**
After backend services are configured and tested, the frontend is deployed on an Amazon EC2 Linux/UNIX instance.


### Steps:

1. **Connect the EC2 instance using ssh client**

2. **Install Node.js and npm**
    - Update system packages: sudo yum update -y
    - Install Node.js 18 using NodeSource:
        - curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        - sudo yum install -y nodejs

3. **Clone the Frontend Code from GitHub (SSH)**
    - Clone your repository using: git clone git@github.com:Omarsherif-11/cloud.git

4. **Configure Environment Variables**
    - In the project root, create a .env.local file.
    - Add the required variables, ( NEXT_PUBLIC_API_BASE_URL=https://tasks )

5. **Build and Start the Frontend**
    - Navigate to the project directory.
    - Install dependencies: npm install
    - Build the frontend: npm run build
    - Start using pm2: pm2 start npm --name "task-management" -- run start

6. **Access the Application** 
    - Open your browser and go to: https://16.16.187.64/



---
## **Post-Deployment Checklist**
- ✅ Update API endpoints in `.env` or frontend config
- ✅ Confirm Cognito login and registration flows
- ✅ Validate task creation and retrieval via API Gateway
- ✅ Ensure emails are delivered via SES
- ✅ Monitor logs and set alarms in CloudWatch

---
---
# User Manual
## 1. Introduction

- Welcome to the Task Management System. This web-based application allows you to create, update, delete, and manage tasks efficiently with secure user authentication, file attachments, and real-time notifications. Built on AWS cloud infrastructure, it ensures security, reliability, and scalability for all users.

## 2. User Registration and Authentication (AWS Cognito)

1. The system uses Amazon Cognito for secure user registration, login, and session management.
2. Cognito manages your credentials and authenticates you securely, preventing unauthorized access.
3. Registration Process:
	Go to the Sign Up page on the web client.
	Enter your valid email and a strong password.
	You may be asked to verify your email via a confirmation code sent to your inbox.
	After verification, your account is activated and ready for use.
4. Login Process:
	Navigate to the Login page.
	Enter your registered email and password.
	Cognito authenticates your credentials and grants access by issuing a secure session token.
	On successful login, you are redirected to the Task Dashboard.
5. Password Management:
	If you forget your password, use the “Forgot Password” feature.
	Cognito guides you through the password reset process securely via email verification.
## 3. Task Management

### 3.1 Creating a Task
1. Click "Create Task" on the dashboard.
2. Fill in task details: title, description, priority level, and due date.
3. Optionally, upload attachments (PDFs, images, documents) via the “Upload” button.
4. Click “Create Task” to save.
### 3.2 Editing a Task
1. Select a task from your dashboard.
2. Click “Edit” to modify details or attachments.
3. Save your changes.
### 3.3 Deleting a Task
1. Select a task.
2. Click “Delete” and confirm to remove it permanently.
### 3.4 Viewing Task Details
1. Click on any task to view all information, including attachments.
## 4. File Attachments
1. Upload files during task creation or editing.
2. Supported types: PDFs, JPEG/PNG images, DOCX, TXT.
3. Files are stored securely in Amazon S3.
4. Access attachments anytime via task details.
## 5. Notifications
1. Receive email alerts when tasks are updated (status, priority, comments).
2. Notifications are sent asynchronously to keep the system responsive.
3. Emails are delivered through AWS SES triggered by background processing using SES and SQS.
## 6. Monitoring and Support
1. System performance, logs, and errors are tracked via AWS CloudWatch.
2. Admins monitor health and performance metrics.
3. Contact support with error details if you experience problems.
## 7. Logging Out
1. Always log out when finished by clicking your user menu and selecting “Logout.”
2. This ensures your session ends securely.
## 8. Backend Workflow and Lambda Functions Overview
  - The backend uses AWS Lambda functions integrated with other AWS services to provide seamless, secure functionality:
### 8.1 User Registration Lambda
1. Triggered on user signup via Cognito.
2. Registers the user in Amazon RDS to sync user profile data.
### 8.2 Task Management Lambda
1. Handles API requests for creating, retrieving, updating, and deleting tasks.
2. Authenticates users via tokens.
3. Interacts with DynamoDB for task metadata and RDS for relational data.
### 8.3 Notification Trigger Lambda
1. Activated on task updates.
2. Maps task IDs to user emails and sends notification messages to SNS.
### 8.4 Notification Sender Lambda
1. Triggered by messages arriving in SQS from SNS.
2. Sends email notifications through Amazon SES.
3. Summary Flow:
	- User signs up → Registration Lambda → stores user in RDS
	- User performs task operations → Task Management Lambda → interacts with DynamoDB & RDS
	- Task updated → Notification Trigger Lambda → sends to SNS → SNS → SQS → Notification Sender Lambda → email sent



---
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

