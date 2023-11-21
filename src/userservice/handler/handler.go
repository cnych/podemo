package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func PingHandler(c *gin.Context) {
	// reqCounter.Add(c.Request.Context(), 1, metric.WithAttributes(
	// 	attribute.String("path", c.Request.URL.Path),
	// 	attribute.String("method", c.Request.Method),
	// 	attribute.String("host", c.Request.Host),
	// 	attribute.Int("code", c.Writer.Status()),
	// ))
	c.JSON(http.StatusOK, gin.H{"message": "pong"})
}

func RegisterHandler(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var id int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", user.Username).Scan(&id)
	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if id != 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	_, err = db.Exec("INSERT INTO users(username, password) VALUES(?, ?)", user.Username, string(hashedPassword))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

func LoginHandler(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var userinfo UserInfo
	var hashedPassword string
	err := db.QueryRow("SELECT id, username, password FROM users WHERE username = ?", user.Username).Scan(&userinfo.ID, &userinfo.Username, &hashedPassword)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Username or password incorrect"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	if bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(user.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Username or password incorrect"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":       userinfo.ID,
		"username": userinfo.Username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, _ := token.SignedString([]byte("your_secret_key"))
	userinfo.Token = tokenString

	c.JSON(http.StatusOK, userinfo)
}

func UserInfoHandler(c *gin.Context) {
	// reqCounter.Add(c.Request.Context(), 1, metric.WithAttributes(
	// 	attribute.String("path", c.Request.URL.Path),
	// 	attribute.String("method", c.Request.Method),
	// 	attribute.String("host", c.Request.Host),
	// 	attribute.Int("code", c.Writer.Status()),
	// ))

	for name, values := range c.Request.Header {
		for _, value := range values {
			fmt.Printf("%s: %s\n", name, value)
		}
	}
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No authorization header"})
		return
	}

	bearerToken := strings.Split(authHeader, " ")
	if len(bearerToken) != 2 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Malformed token"})
		return
	}

	token, err := jwt.Parse(bearerToken[1], func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte("your_secret_key"), nil
	})
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		var userinfo UserInfo
		// Token 里面包含了用户的 ID 和 Username 信息
		userinfo.ID = int(claims["id"].(float64))
		userinfo.Username = claims["username"].(string)
		userinfo.Token = bearerToken[1]

		c.JSON(http.StatusOK, userinfo)
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
	}
}
