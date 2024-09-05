# IoT 5506 Group 3 Project

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

## Important Considerations

1. When working with `globals.css`, be cautious as changes can affect the entire project.
2. Ensure consistent use of components from the `components` folder to maintain UI coherence.
3. When adding new API endpoints or utility functions, place them in the `libs` folder for easy access and management.

## Additional Information

- Ensure Docker Desktop is running before starting the containers.
- For any issues or contributions, please refer to the project's issue tracker or contact the maintainers.

Happy coding!