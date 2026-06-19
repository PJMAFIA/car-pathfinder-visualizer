from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from queue import PriorityQueue

app = FastAPI()

# Allow React to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODELS ---
class SolveRequest(BaseModel):
    grid: List[List[int]] # 0 = Empty, 1 = Wall
    start: Tuple[int, int]
    end: Tuple[int, int]
    algorithm: str # "A_STAR" or "BFS"

class SolveResponse(BaseModel):
    visited_nodes: List[Tuple[int, int]]
    path: List[Tuple[int, int]]
    cost: int
    nodes_explored: int
    success: bool

# --- HELPER FUNCTIONS ---
def h(p1, p2):
    return abs(p1[0] - p2[0]) + abs(p1[1] - p2[1])

def get_neighbors(node, grid_size, grid_data):
    r, c = node
    neighbors = []
    # DOWN, UP, RIGHT, LEFT
    directions = [(1, 0), (-1, 0), (0, 1), (0, -1)]
    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < grid_size and 0 <= nc < grid_size and grid_data[nr][nc] != 1:
            neighbors.append((nr, nc))
    return neighbors

# --- A* ALGORITHM ---
def run_a_star(grid: List[List[int]], start: Tuple[int, int], end: Tuple[int, int]):
    grid_size = len(grid)
    count = 0
    open_set = PriorityQueue()
    open_set.put((0, count, start))
    came_from = {}
    
    g_score = { (r, c): float("inf") for r in range(grid_size) for c in range(grid_size) }
    g_score[start] = 0
    f_score = { (r, c): float("inf") for r in range(grid_size) for c in range(grid_size) }
    f_score[start] = h(start, end)
    
    open_set_hash = {start}
    visited_nodes = [] # Tracks the order of exploration for the frontend animation

    while not open_set.empty():
        current = open_set.get()[2]
        open_set_hash.remove(current)
        
        if current != start and current != end:
            visited_nodes.append(current)

        if current == end:
            # Reconstruct Path
            path = []
            curr = end
            while curr in came_from:
                curr = came_from[curr]
                if curr != start:
                    path.append(curr)
            path.reverse()
            return SolveResponse(
                visited_nodes=visited_nodes, path=path, cost=len(path)+1, 
                nodes_explored=len(visited_nodes), success=True
            )

        for neighbor in get_neighbors(current, grid_size, grid):
            temp_g_score = g_score[current] + 1
            if temp_g_score < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = temp_g_score
                f_score[neighbor] = temp_g_score + h(neighbor, end)
                if neighbor not in open_set_hash:
                    count += 1
                    open_set.put((f_score[neighbor], count, neighbor))
                    open_set_hash.add(neighbor)

    return SolveResponse(visited_nodes=visited_nodes, path=[], cost=0, nodes_explored=len(visited_nodes), success=False)

# --- API ENDPOINT ---
# Notice the route is now /api/solve to match Vercel's routing perfectly
@app.post("/api/solve", response_model=SolveResponse)
def solve_maze(req: SolveRequest):
    if req.algorithm == "A_STAR":
        return run_a_star(req.grid, req.start, req.end)
    return run_a_star(req.grid, req.start, req.end)