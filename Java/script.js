document.addEventListener('DOMContentLoaded', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const svg = d3.select("#networkGraph")
        .attr("width", width)
        .attr("height", height);

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
        .attr("r", 5)
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
                    if (isConnected(i, j, k)) {
                        triangles.push([i, j, k]);
                    }
                }
            }
        }

        return triangles;
    }

    function updateFaces() {
        svg.selectAll(".face").remove(); // Remove old faces

        const faces = findTriangles();
        const faceGroup = svg.append("g")
            .attr("class", "faces");

        faces.forEach(face => {
            const points = face.map(i => [nodes[i].x, nodes[i].y]);
            points.push(points[0]); // Close the path

            faceGroup.append("polygon")
                .attr("class", "face")
                .attr("points", points.map(p => p.join(",")).join(" "))
                .attr("fill", "rgba(255, 100, 100, 0.5)") // Color with opacity
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        });
    }

    function tick() {
        updateLinks();
        updateNodes();
        updateFaces(); // Update faces on each tick
    }

    function update() {
        nodes.forEach(node => {
            node.x += node.dx;
            node.y += node.dy;

            if (node.x < 0 || node.x > width) node.dx *= -1;
            if (node.y < 0 || node.y > height) node.dy *= -1;
        });

        tick();
        requestAnimationFrame(update);
    }

    update();

    function onMouseMove(event) {
        const [mouseX, mouseY] = d3.pointer(event);

        const followingNode = nodes[0];
        followingNode.x = mouseX;
        followingNode.y = mouseY;

        tick();
    }

    svg.on("mousemove", onMouseMove);

    const targetText = "Elijah Appelson";
    const output = document.getElementById('header-effect');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:',.<>?/";
    let index = 0;
    const delay = 100;

    function getRandomChar() {
        return chars[Math.floor(Math.random() * chars.length)];
    }

    function updateHeader() {
        let randomText = "";
        for (let i = 0; i < targetText.length; i++) {
            if (i < index) {
                randomText += targetText[i];
            } else {
                randomText += getRandomChar();
            }
        }
        output.textContent = randomText;

        if (index < targetText.length) {
            index++;
            setTimeout(updateHeader, delay);
        }
    }

    updateHeader();
});
