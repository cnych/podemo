package handler

import (
	"database/sql"
	"log"

	"github.com/dgrijalva/jwt-go"
	_ "github.com/go-sql-driver/mysql"
)

type JWT struct {
	Token string `json:"token"`
	jwt.StandardClaims
}

type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type UserInfo struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

var db *sql.DB

func init() {
	var err error
	db, err = sql.Open("mysql", "otel:otel321@tcp(localhost:3306)/bookdb?parseTime=true")
	if err != nil {
		log.Fatal(err)
	}
}
