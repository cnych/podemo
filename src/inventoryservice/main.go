package main

import (
	"github.com/cnych/bookstore/src/inventoryservice/handler"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/inventory", handler.GetInventoryHandler)
	r.GET("/inventory/:bookID", handler.GetBookInventoryHandler)
	r.Run(":8083") // listen and serve on 0.0.0.0:8083
}
