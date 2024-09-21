// Import Cytoscape and edgehandles
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

cytoscape.use(edgehandles);

import { useEffect, useState } from 'react';
import './App.css';
import {
  Input, Textarea, Button, Card, CardHeader, Heading, Menu,
  MenuButton, MenuList, MenuItemOption, MenuOptionGroup, MenuDivider,
  VStack, HStack, ChakraProvider, Box, Flex, Image, 
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import Split from 'react-split';
import { useToast } from '@chakra-ui/react';

function App() {
  const [cy, setcy] = useState([]);
  const [drawedge, setdrawedge] = useState({});
  const [directed, setdirected] = useState('none');
  const [bfsStartNode, setBfsStartNode] = useState(''); 
  const [dfsStartNode, setDfsStartNode] = useState(''); 
  const [traversalResult, setTraversalResult] = useState([]); 


  useEffect(() => {
    let cy1 = cytoscape({
      container: document.getElementById('cy'),
      style: [
        {
          selector: 'node',
          style: {
            "border-width": '2px',
            'width': '40px',
            'height': '40px',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': 'white',
            'content': 'data(id)',
            'font-size': '20px',
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': 'black',
            'target-arrow-color': 'black',
            'target-arrow-shape': `${directed}`,
            'curve-style': 'bezier',
          }
        },
        // If graph contains weight
        {
          selector: 'edge[showWeight]',
          style: {
            'label': 'data(weight)',   
            'font-size': '20px',       
            'color': 'blue',           
            'text-outline-color': 'white', 
            'text-outline-width': 3,   
            'text-margin-y': -10,      
            'text-rotation': 'autorotate', 
        }
        },
        // If graph do not contain weight
        {
          selector: 'edge[!showWeight]',
          style: {
            'label': '',
          }
        },
        {
          selector: '.highlighted',
          style: {
            'background-color': 'yellow',
            'border-color': 'red',
            'border-width': '3px',
          }
        },
      ],
    });

    setdrawedge(cy1.edgehandles());
    setcy(cy1);
  },[]);
  
  const toast = useToast();
  
  function generate() {
    cy.elements().remove();
    const arr = [];
    const val = document.querySelector(".node_number");
    const n = val.value; 

    // Allow backspace: Only proceed if the input is empty or a valid number
    if (n === "" || !isNaN(n) && n > 0) {
        const nodeCount = parseInt(n);
        
        for (var i = 0; i < nodeCount; i++) {
            arr.push({ data: { id: `${i}` } });
        }
        
        cy.add(arr);
        let layoutOptions = {
            name: 'circle',
            fit: true,
        };
        cy.layout(layoutOptions).run();
        add_edge();
        graph_specification(directed);
    } else {
      // Warning
        toast({
            title: "Invalid Input",
            description: "Please enter a valid number of nodes or use backspace to delete.",
            status: "warning",
            duration: 2000,
            isClosable: true,
        });
    }
  }


  function add_edge() {
    cy.edges().remove();
    const edgeLines = document.querySelector(".edge_specification").value.split('\n');
    
    for (let i = 0; i < edgeLines.length; i++) {
      const parts = edgeLines[i].split(' ');
  
      // If the input format is "source target" (unweighted)
      if (parts.length === 2) {
        const [source, target] = parts;
        try {
          cy.add([
            {
              data: { 
                source: `${source}`, 
                target: `${target}`, 
                weight: '1',  // Default weight set to 1 
                showWeight: false 
              }
            }
          ]);
        } catch (error) {
          console.error('Error adding unweighted edge:', error);
        }
      }
      // If the input format is "source target weight" (weighted)
      else if (parts.length === 3) {
        const [source, target, weight] = parts;
        try {
          cy.add([
            {
              data: { 
                source: `${source}`, 
                target: `${target}`, 
                weight: `${weight}`, // Use the provided weight
                showWeight: true  
              }
            }
          ]);
        } catch (error) {
          console.error('Error adding weighted edge:', error);
        }
      }
    }
    
    graph_specification(directed);
  }
  

  function bfs(startNodeId) {
    if (!cy.getElementById(startNodeId).length) {
      toast({
          title: "Invalid Node ID",
          description: `Node with ID ${startNodeId} does not exist.`,
          status: "error",
          duration: 2500,
          isClosable: true,
      });
      return;
  }
    cy.elements().removeClass('highlighted'); 
    let visited = new Set();
    let queue = [cy.getElementById(startNodeId)];
    let result = [];
    let delay = 500; // Delay in milliseconds between steps

    function visitNext() {
      if (queue.length === 0) {
        setTraversalResult(result);
        return;
      }

      let node = queue.shift();
      if (!visited.has(node.id())) {
        node.addClass('highlighted'); // Highlight visited node
        result.push(node.id());
        visited.add(node.id());

        node.connectedEdges().filter(edge => edge.source().id() === node.id()).forEach(edge => {
          let target = edge.target();
          if (!visited.has(target.id())) {
            queue.push(target);
          }
        });
      }

      // Schedule the next step
      setTimeout(visitNext, delay);
    }

    visitNext(); // Start the BFS traversal
  }

  function dfs(startNodeId) {
    if (!cy.getElementById(startNodeId).length) {
      toast({
          title: "Invalid Node ID",
          description: `Node with ID ${startNodeId} does not exist.`,
          status: "error",
          duration: 2500,
          isClosable: true,
      });
      return;
  }
    cy.elements().removeClass('highlighted'); // Clear previous highlights
    let visited = new Set();
    let stack = [cy.getElementById(startNodeId)];
    let result = [];
    let delay = 500; // Delay in milliseconds between steps

    function visitNext() {
      if (stack.length === 0) {
        setTraversalResult(result);
        return;
      }

      let node = stack.pop();
      if (!visited.has(node.id())) {
        node.addClass('highlighted'); // Highlight visited node
        result.push(node.id());
        visited.add(node.id());

        node.connectedEdges().filter(edge => edge.source().id() === node.id()).forEach(edge => {
          let target = edge.target();
          if (!visited.has(target.id())) {
            stack.push(target);
          }
        });
      }

      // Schedule the next step
      setTimeout(visitNext, delay);
    }

    visitNext(); // Start the DFS traversal
  }

  function download_graph_png() {
    const canvas = document.querySelector('canvas[data-id="layer2-node"]');

    const link = document.createElement('a');
    const dataURL = canvas.toDataURL('image/png');
    link.href = dataURL;
    link.download = 'graph.png';
    link.click();

    toast({
        title: "Download Successful",
        description: "Graph has been downloaded.",
        status: "success",
        duration: 2000,
        isClosable: true,
    });
}


  function Draw_on() {
    // Enable draw mode
    drawedge.enableDrawMode();
    document.body.style.cursor = 'crosshair';
  
    // Ensure any new edges respect the current directed/undirected state
    cy.edges().forEach((edge) => {
      edge.style({
        'target-arrow-shape': directed === 'triangle' ? 'triangle' : 'none'
      });
    });
  }

  function Draw_off() {
    drawedge.disableDrawMode();
    document.body.style.cursor = 'default';
  }

  function graph_specification(num) {
    setdirected(num); // Update the state for any other usage, like showing it in the UI
    
    // Dynamically update the edge style without re-rendering the whole graph
    cy.edges().forEach(edge => {
      edge.style({
        'target-arrow-shape': `${num}`,
      });
    });
  }
  

  function resetGraph() {
    setTraversalResult('');
    
    setBfsStartNode('');
    setDfsStartNode('');
    
    cy.elements().removeClass('highlighted');

    toast({
      title: "Graph Reset",
      description: "The graph has been reset.",
      status: "info",
      duration: 2000,
      isClosable: true,
  });
  }

  function newGraph() {
    resetGraph();
    if (cy) {
      cy.elements().remove();
    }
    document.querySelector(".node_number").value = ''; 
    document.querySelector(".edge_specification").value = '';

    toast({
      title: "New Graph Created",
      description: "All previous data has been cleared.",
      status: "info",
      duration: 2000,
      isClosable: true,
  });
  }

    return (
      <ChakraProvider>
        <Split className="split">
          <div className="nodes_input">
            <Card marginTop="5px" width="90%" maxWidth="600px" backgroundColor="lightcyan">
              <CardHeader>
                <Flex align="center" justify="center" wrap="wrap">
                  <Image
                    src="./bfs_dfs.gif"
                    alt="Graph Visualization"
                    height='100px'
                    width='200px'
                    mr="20px"
                    maxW="100%"
                  />
                <Box textAlign="center" my={4} py={4} borderRadius="md">
                <Heading fontFamily="monospace" fontWeight="700" fontSize='xx-large' letterSpacing="wide" 
                  textAlign="center" color="blue.600" >
                    Graphify
                </Heading>
                </Box>

                </Flex>
              </CardHeader>
            </Card>
  
            <VStack spacing={4} align="stretch" padding="10px">
              {/* Vertices Input */}
              <Input variant='filled' onChange={generate} placeholder='Enter Number Of Vertices' width='100%' className="node_number" />
  
              {/* Edges Input */}
              <Textarea variant="filled" onChange={add_edge} placeholder={`Enter Edges\nUnweighted -> (Source,Target) eg. 2 3\nWeighted -> (Source,Target,Weight) eg. 2 3 4`} height="250px" className="edge_specification" />

              {/* BFS Input and Button */}
              <HStack spacing={3}>
                <Input value={bfsStartNode} onChange={(e) => setBfsStartNode(e.target.value)} width="70%" placeholder="Enter BFS Start Node" className="bfs_input" />
                <Button onClick={() => bfs(bfsStartNode)} colorScheme='blue' variant='solid' className="bfs_button">Start BFS</Button>
                <Button colorScheme='red' onClick={resetGraph}>Reset</Button>
              </HStack>
  
              {/* DFS Input and Button */}
              <HStack spacing={3}>
                <Input value={dfsStartNode} onChange={(e) => setDfsStartNode(e.target.value)} width="70%" placeholder="Enter DFS Start Node" className="dfs_input" />
                <Button onClick={() => dfs(dfsStartNode)} colorScheme='blue' variant='solid' className="dfs_button">Start DFS</Button>
                <Button colorScheme='red' onClick={resetGraph}>Reset</Button>
              </HStack>
  
              {/* Traversal Result */}
              <Box textAlign="center">
                <Heading size="md">Traversal Result:</Heading>
                <Box padding="10px" border="1px solid #ccc" borderRadius="5px" bg="white">
                {Array.isArray(traversalResult) ? traversalResult.join(', ') : traversalResult}
                </Box>
              </Box>
            </VStack>
          </div>
  
          <div className="cy-container">
          <div className="graph-specification">
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} colorScheme='blue' >
                Customizations <ChevronDownIcon />
              </MenuButton> 
              <MenuList minWidth='240px'>
                <MenuOptionGroup defaultValue='asc' title='Type' type='radio'>
                  <MenuItemOption value="directed" onClick={event => graph_specification('triangle')}>Directed</MenuItemOption>
                  <MenuItemOption value="undirected" onClick={event => graph_specification('none')}>UnDirected</MenuItemOption>
                </MenuOptionGroup>
                <MenuDivider />
                <MenuOptionGroup title='Draw Mode' type='radio'>
                  <MenuItemOption value='normal' onClick={Draw_off}>Normal Mode</MenuItemOption>
                  <MenuItemOption value='draw' onClick={Draw_on}>Draw Mode</MenuItemOption>
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            <Button colorScheme="green" ml='10px' onClick={newGraph} >New Graph</Button>
          </div>
          <div id="cy" style={{ height: '500px', width: '100%', marginTop: '20px' }}></div>
          <Button onClick={download_graph_png} colorScheme='blue' variant='solid' marginTop="10px">
                Download Png
              </Button>
        </div>
      </Split>
    </ChakraProvider>
  );
}

export default App;


