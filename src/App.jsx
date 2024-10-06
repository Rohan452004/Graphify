// Import Cytoscape and edgehandles
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

cytoscape.use(edgehandles);

import { useEffect, useState } from 'react';
import './App.css';
import {
  Input, Textarea, Button, Card, CardHeader, Heading, Menu,
  MenuButton, MenuList, MenuItemOption, MenuOptionGroup, MenuDivider,
  VStack, HStack, ChakraProvider, Box, Flex, Image, Radio, RadioGroup
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useToast } from '@chakra-ui/react';
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  const [cy, setcy] = useState([]);
  const [drawedge, setdrawedge] = useState({});
  const [directed, setdirected] = useState('none');
  const [bfsStartNode, setBfsStartNode] = useState(''); 
  const [dfsStartNode, setDfsStartNode] = useState(''); 
  const [traversalResult, setTraversalResult] = useState([]); 
  const [indexing, setIndexing] = useState('0');

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
            let nodeId = indexing === '1' ? i + 1 : i;
            arr.push({ data: { id: `${nodeId}` } });
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
      <div className="split">
        <div className="nodes_input">
          <Card marginTop="7px" width="90%" maxWidth="600px" backgroundColor="lightcyan">
            <CardHeader>
              <Flex align="center" justify="center" wrap="wrap">
                <Image
                  src="./bfs_dfs.gif"
                  alt="Graph Visualization"
                  height={{ base: '80px', md: '100px' }}
                  width={{ base: '120px', md: '200px' }}
                  mr={{ base: '5px', md: '20px' }}
                  maxW="100%"
                />
                <Box textAlign="center" my={4} py={2} borderRadius="md">
                  <Heading fontFamily="cursive" fontStyle="italic" fontWeight="1000" fontSize={{ base: 'x-large', md: 'xx-large' }}  color="blue.600">
                    Graphify
                  </Heading>
                </Box>
              </Flex>
            </CardHeader>
          </Card>
    
          <VStack spacing={4} align="stretch" padding="10px" width="100%">
            <Box>
              <Heading size="sm" mb="2">Choose Indexing Type</Heading>
              <RadioGroup onChange={setIndexing} value={indexing}>
                <HStack spacing="24px">
                  <Radio value="0">0-based Indexing</Radio>
                  <Radio value="1">1-based Indexing</Radio>
                </HStack>
              </RadioGroup>
            </Box>
    
            {/* Vertices Input */}
            <Input variant='filled' onChange={generate} placeholder='Enter Number Of Vertices' width='100%' className="node_number" />
    
            {/* Edges Input */}
            <Textarea variant="filled" onChange={add_edge} placeholder={`Enter Edges\nUnweighted -> (Source,Target) eg. 2 3\nWeighted -> (Source,Target,Weight) eg. 2 3 4`} height="250px" className="edge_specification" />
    
            {/* BFS Input and Button */}
            <HStack spacing={3}>
              <Input value={bfsStartNode} onChange={(e) => setBfsStartNode(e.target.value)} width={{ base: "60%", md: "70%" }} placeholder="Enter BFS Start Node" className="bfs_input" />
              <Button onClick={() => bfs(bfsStartNode)} colorScheme='blue' variant='solid' className="bfs_button">Start BFS</Button>
              <Button colorScheme='red' onClick={resetGraph}>Reset</Button>
            </HStack>
    
            {/* DFS Input and Button */}
            <HStack spacing={3}>
              <Input value={dfsStartNode} onChange={(e) => setDfsStartNode(e.target.value)} width={{ base: "60%", md: "70%" }} placeholder="Enter DFS Start Node" className="dfs_input" />
              <Button onClick={() => dfs(dfsStartNode)} colorScheme='blue' variant='solid' className="dfs_button">Start DFS</Button>
              <Button colorScheme='red' onClick={resetGraph}>Reset</Button>
            </HStack>
    
          </VStack>
        </div>
    
        <div className="cy-container">
          <div className="graph-specification">
            <Menu closeOnSelect={true}>
              <MenuButton as={Button} colorScheme='blue' mt={{ base: '10px', md: '0' }}>
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
            <Button colorScheme="green" ml={{ base: '10px', md: '10px' }} mt={{ base: '10px', md: '0' }} onClick={newGraph}>
              New Graph
            </Button>
          </div>
          <div id="cy" style={{ height: '500px', width: '100%', marginTop: '20px' }}></div>
          <HStack
            spacing={{ base: 2, md: 4 }} 
            align="center"
            justify={{ base: "center", md: "space-around" }} 
            flexDirection={{ base: "column", md: "row" }} 
            width="100%"
            marginTop="10px"
          >
            {/* Traversal Result */}
            <Box textAlign={{ base: "center", md: "left" }} marginRight={{ md: "200px" }} marginBottom="10px" width={{ base: "70%", md: "auto" }}>
              <Heading size="md" mb={2}>Traversal Result:</Heading>
              <Box padding="10px" border="1px solid #ccc" borderRadius="5px" bg="white" width={{ base: "100%", md: "auto" }}>
                {Array.isArray(traversalResult) ? traversalResult.join(', ') : traversalResult}
              </Box>
            </Box>
    
            {/* Download Button */}
            <Button
              onClick={download_graph_png}
              colorScheme="blue"
              variant="solid"
              marginTop={{ base: "10px", md: "0" }} 
              marginBottom={{ base: "10px", md: "0" }} 
              width={{ base: "70%", md: "auto" }} 
            >
              Download PNG
            </Button>
          </HStack>
        </div>
        </div>
      <SpeedInsights />
    </ChakraProvider>
    
  );
}

export default App;


