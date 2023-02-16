# socket-with-cluster
The code creates a worker instance using Redis which basically acts as a proxy server between incoming client requests and servers to maintain a stateful connection between client IPs and their respective servers.

#### The way it works is as follows:
- It creates a proxy server between incoming requests and server instances and maps them upon new connections


#### Usage:
- `node benchmark <num_workers>` to test for speeds when we generate 1 million random IPs
