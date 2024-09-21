# Graphify - Graph Visualization Tool

Graphify is an interactive graph visualization tool built with React, Cytoscape.js, and Chakra UI. This web app allows users to generate, visualize, and interact with graphs by providing vertices, edges, and customizing properties like edge direction and weight. Additionally, it features BFS and DFS traversal algorithms with animated visualizations of graph exploration.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Customization](#customization)
- [Graph Operations](#graph-operations)
- [Technologies Used](#technologies-used)
- [Future Improvements](#future-improvements)
- [License](#license)

## Features
- **Graph Creation:** Enter a number of vertices and edges to generate a graph.
- **Edge Specification:** Add weighted or unweighted edges.
- **Traversal Algorithms:** Perform Breadth-First Search (BFS) or Depth-First Search (DFS) and visualize the step-by-step process.
- **Graph Customization:** Choose between directed or undirected graphs, enable draw mode for creating edges manually.
- **Graph Download:** Download the graph as a PNG image for offline usage.

## Installation

### Prerequisites
Ensure you have the following installed:
- Node.js (v14.x or later)
- npm (v6.x or later)

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/graphify.git
    cd graphify
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the development server:
    ```bash
    npm run dev
    ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser to interact with the app.

## Usage
1. **Enter Number of Vertices:** Input the number of nodes in the graph.
2. **Define Edges:**
   - Unweighted edges: Enter in the format `source target` (e.g., `0 1`).
   - Weighted edges: Enter in the format `source target weight` (e.g., `0 1 3`).
3. **Graph Customization:**
   - Select between directed and undirected graphs.
   - Enable "Draw Mode" to add edges by dragging between nodes.
4. **Graph Traversal:**
   - Input a node ID to start BFS or DFS traversal.
   - View traversal order and animated highlights on the graph.
5. **Download Graph:** Download the graph as a PNG image.

## Customization
- **Directed vs. Undirected:** Users can toggle between directed (with arrows) and undirected (without arrows) graphs.
- **Draw Mode:** Add edges between nodes manually by enabling the draw mode.
- **Traversal Customization:** Input a starting node for BFS/DFS, and the tool will animate the graph traversal.

## Graph Operations

### Graph Creation
- Enter the number of vertices in the provided input field. The graph will auto-generate with nodes arranged in a circular layout.
- The layout can be customized by modifying the layout options (name: 'circle').

### Adding Edges
- In the edge specification box, input edges in the format:
  - Unweighted: `source target`
  - Weighted: `source target weight`

### BFS and DFS Traversal
- BFS (Breadth-First Search) and DFS (Depth-First Search) algorithms are implemented.
- After entering the start node, click the respective button to animate the traversal. The visited nodes will be highlighted, and the traversal order will be displayed.

### Download as PNG
- Click the Download PNG button to download the current graph as an image.

## Technologies Used
- React.js: Frontend framework.
- Cytoscape.js: Graph visualization library.
- Cytoscape-edgehandles: Extension for edge drawing between nodes.
- Chakra UI: Component library for UI elements.
- React-Split: Used for creating the resizable split view.

## Future Improvements
- **Algorithm Support:** Add more graph algorithms such as Dijkstra’s shortest path, Prim’s or Kruskal’s MST, etc.
- **Node Deletion:** Allow users to delete nodes and edges.
- **More Layouts:** Add more graph layout algorithms such as grid, random, etc.

## License
This project is licensed under the MIT License.

## Contact
For any inquiries or feedback, feel free to reach out.
