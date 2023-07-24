package main

import (
	"github.com/cnych/bookstore/src/userservice/handler"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/ping", handler.PingHandler)
	router.POST("/register", handler.RegisterHandler)
	router.POST("/login", handler.LoginHandler)
	router.GET("/userinfo", handler.UserInfoHandler)

	router.Run(":8080")
}
