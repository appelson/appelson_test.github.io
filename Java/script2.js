document.addEventListener('DOMContentLoaded', function () {
    const scaleFactor = 0.3; // Adjust this value to scale down the SVG
    const maxDistanceFromCentroid = 150; // Maximum distance from the centroid

    const svg = d3.select("#networkGraph")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight * scaleFactor);

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const numNodes = 6;
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        dx: Math.random() * 2 - 1,
        dy: Math.random() * 2 - 1
    }));

    const links = [];
    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            links.push({ source: i, target: j });
        }
    }

    const link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", "link");

    const node = svg.selectAll(".node")
        .data(nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 3) // Scaled down radius
        .attr("fill", "steelblue");

    function updateLinks() {
        link
            .attr("x1", d => nodes[d.source].x)
            .attr("y1", d => nodes[d.source].y)
            .attr("x2", d => nodes[d.target].x)
            .attr("y2", d => nodes[d.target].y);
    }

    function updateNodes() {
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    function findTriangles() {
        const triangles = [];
        const linkSet = new Set(links.map(link => [link.source, link.target].sort().join(',')));

        function isConnected(a, b, c) {
            return linkSet.has([a, b].sort().join(',')) && 
                   linkSet.has([b, c].sort().join(',')) && 
                   linkSet.has([c, a].sort().join(','));
        }

        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                for (let k = j + 1; k < numNodes; k++) {
                    if (isConnected(i, j, k)) triangles.push([i, j, k]);
                }
            }
        }

        return triangles;
    }

    function updateFaces() {
        svg.selectAll(".face").remove();

        const faces = findTriangles();
        const faceGroup = svg.append("g").attr("class", "faces");

        faces.forEach(face => {
            const points = face.map(i => [nodes[i].x, nodes[i].y]);
            points.push(points[0]);

            faceGroup.append("polygon")
                .attr("class", "face")
                .attr("points", points.map(p => p.join(",")).join(" "))
                .attr("fill", "rgba(255, 100, 100, 0.5)")
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        });
    }

    function computeCentroid() {
        let sumX = 0;
        let sumY = 0;
        nodes.forEach(node => {
            sumX += node.x;
            sumY += node.y;
        });
        return {
            x: sumX / numNodes,
            y: sumY / numNodes
        };
    }

    function constrainToCentroid(node, centroid) {
        const dx = node.x - centroid.x;
        const dy = node.y - centroid.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > maxDistanceFromCentroid) {
            const angle = Math.atan2(dy, dx);
            node.x = centroid.x + maxDistanceFromCentroid * Math.cos(angle);
            node.y = centroid.y + maxDistanceFromCentroid * Math.sin(angle);
        }
    }

    function tick() {
        updateLinks();
        updateNodes();
        updateFaces();
    }

    function update() {
        const centroid = computeCentroid();

        nodes.forEach(node => {
            node.x += node.dx;
            node.y += node.dy;

            // Constrain node positions within the max distance from the centroid
            constrainToCentroid(node, centroid);

            // Bounce nodes back if they are outside the bounds of the SVG
            if (node.x < 0 || node.x > width) node.dx *= -1;
            if (node.y < 0 || node.y > height) node.dy *= -1;
        });

        tick();
        requestAnimationFrame(update);
    }

    update();

    svg.on("mousemove", function(event) {
        const [mouseX, mouseY] = d3.pointer(event);
        nodes[0].x = mouseX;
        nodes[0].y = mouseY;
        tick();
    });

});
