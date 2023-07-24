package handler

import (
	"log"

	"github.com/jmoiron/sqlx"

	_ "github.com/go-sql-driver/mysql"
)

type Inventory struct {
	BookID int `db:"book_id" json:"book_id"`
	Amount int `db:"amount" json:"amount"`
}

var db *sqlx.DB

func init() {
	var err error
	db, err = sqlx.Connect("mysql", "otel:otel321@tcp(localhost:3306)/bookdb?parseTime=true")
	if err != nil {
		log.Fatalln(err)
	}
}

func getAllInventory() ([]Inventory, error) {
	var inventory []Inventory
	err := db.Select(&inventory, "SELECT book_id, amount FROM inventory")
	return inventory, err
}

func getInventoryByBookID(bookID string) (Inventory, error) {
	var inventory Inventory
	err := db.Get(&inventory, "SELECT book_id, amount FROM inventory WHERE book_id = ?", bookID)
	return inventory, err
}
