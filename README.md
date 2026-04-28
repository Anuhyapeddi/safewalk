# Summary 

SafeWalk is a web application that helps users find the safest walking routes by combining machine learning based risk modeling with graph based path optimization. The backend is built using FastAPI and exposes RESTful APIs that process historical crime data, temporal signals, and geospatial features to calculate safety scores for individual road segments. Logistic regression and tree based ensemble models are used to estimate crime risk probabilities, while spatial clustering and density analysis are applied to identify high risk areas. These risk scores are incorporated into a weighted graph, where Dijkstra and A* routing algorithms compute routes that prioritize safety while still keeping distances reasonable. The system is designed to support scalable, low latency inference and integrates seamlessly with mapping services.

# Getting Started with Create React App

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


