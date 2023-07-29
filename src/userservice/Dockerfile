# Step 1: build the application
FROM golang:1.19 as builder

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy everything from the current directory to the PWD (Present Working Directory) inside the container
COPY . .

# Build the Go app
RUN export GOPROXY=https://goproxy.cn && go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Step 2: Build the distroless container
FROM gcr.dockerproxy.com/distroless/base-debian10

# Copy the binary from builder
COPY --from=builder /app/main /app/main

# Expose the application on port 8080 (if necessary)
EXPOSE 8080

# Run the binary
CMD ["/app/main"]
