# IoT 5506 Group 3 Project

## Project Overview

This is an out-of-the-box open-source IoT platform specifically designed for Firebeetle and Xiao ESP32S3. The platform utilizes Docker for CI/CD automated builds, uses Sqlite3 as the default database management system, and provides Nginx port forwarding settings.

### Key Features

- Designed for Firebeetle and Xiao ESP32S3 hardware
- CI/CD automation using Docker
- Sqlite3 database management (with option to rebuild for MongoDB)
- Nginx port forwarding configuration
- Cloud server integration support
- SMTP server support
- Arduino-compatible hardware code upload

## Getting Started

To start the project, follow these steps:

1. **Build Docker Images**:
   Use the following command to build the Docker images:
   ```sh
   docker compose up --build
   ```

2. **Start Docker Containers**:
   If the `Dockerfile` has not been updated, you can start the containers using the script:
   ```sh
   ./docker-start.sh
   ```

## Prerequisites

- **Docker Desktop**:
  It is recommended to install Docker Desktop before using Docker. You can download it from [Docker's official website](https://www.docker.com/products/docker-desktop).
- **VSCode**:
  For the best experience, it is recommended to open and edit this project using Visual Studio Code (VSCode). You can download it from [VSCode's official website](https://code.visualstudio.com/).

## Frontend Structure Explanation

### Framework and Styling

- Our frontend is built using the **Vite+React** framework.
- For styling, we primarily use **TailwindCSS**, although regular CSS can also be used when necessary.

### Project Structure

#### src (Main Project Folder)

The `src` directory is the core of our frontend project. It contains the following key subdirectories:

#### pages

- This folder contains all our page files.
- Each file typically represents a distinct route or view in our application.

#### components

- Houses our reusable UI components.
- These components can be shared across different pages to maintain consistency and reduce code duplication.

#### libs

- Contains API endpoints and JavaScript utility functions.
- Examples include:
  - API addresses
  - Regular expression matching utilities

#### Styles

- Holds CSS files for the entire project.
- Notable file:
  ```
  globals.css
  ```
  - Serves TailwindCSS
  - Defines custom class names
  - **Note**: Handle with caution as it affects the global styling

## Backend Structure

### app Folder

- Contains user database processing logic.
- Includes User View for handling user-related operations.

### Future Plans

- We plan to add Python operations for time-series database management.

## Database Options

By default, this project uses Sqlite3 as the database management system. If you wish to use MongoDB, you can rebuild it following these steps:

1. Add MongoDB service in the `docker-compose.yml` file.
2. Update the backend code to use MongoDB connection.
3. Modify relevant data access layer code to adapt to MongoDB query syntax.

## Cloud Server and SMTP Configuration

In the `backend/.env` file, you can add cloud server information and SMTP server account information:

```
# SMTP server configuration

EMAIL_HOST_USER = ""
EMAIL_HOST_PASSWORD = ""
```

Please ensure to keep this sensitive information confidential and do not commit it to public code repositories.

## Hardware Code Upload Considerations

Before uploading hardware code using Arduino, be sure to add WiFi SSID and password in the macro definitions. For example:

```cpp
#define SSID "Your SSID"
#define PW "Password"
```

This ensures that your IoT device can correctly connect to the specified WiFi network.

## Nginx Port Forwarding

This project includes Nginx configuration for port forwarding. You can find the relevant settings in the `nginx/nginx.conf` file. You can modify port mappings or add other server blocks as needed.

## Important Considerations

1. When working with `globals.css`, be cautious as changes can affect the entire project.
2. Ensure consistent use of components from the `components` folder to maintain UI coherence.
3. When adding new API endpoints or utility functions, place them in the `libs` folder for easy access and management.

## Contribution Guidelines

We welcome community contributions! If you want to contribute to this open-source IoT platform, please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Additional Information

- Ensure Docker Desktop is running before starting the containers.
- For any issues or contributions, please refer to the project's issue tracker or contact the maintainers.

Happy coding!