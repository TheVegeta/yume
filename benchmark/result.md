oha -n 100 -c10 -z 5s http://localhost:3000

| Framwork      | Result (Requests/sec) | Percentage |
| ------------- | --------------------- | ---------- |
| fiber         | 59207.6047            | 31.22 %    |
| yume-server   | 55609.1203            | 29.32 %    |
| hyper-express | 45517.4531            | 24.00 %    |
| native-node   | 22000.3991            | 11.60 %    |
| express       | 7338.0182             | 3.87 %     |

oha -n 100 -c10 -z 5s http://localhost:3000/user/12345

| Framwork      | Result (Requests/sec) | Percentage |
| ------------- | --------------------- | ---------- |
| fiber         | 46464.8444            | 28.24 %    |
| yume-server   | 45179.7769            | 27.46 %    |
| hyper-express | 43708.3883            | 26.57 %    |
| native-node   | 21942.6999            | 13.34 %    |
| express       | 7210.9611             | 4.38 %     |
