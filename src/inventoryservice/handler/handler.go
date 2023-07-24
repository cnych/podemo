package handler

import (
	"github.com/gin-gonic/gin"
)

func GetInventoryHandler(c *gin.Context) {
	inventory, err := getAllInventory()
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, inventory)
}

func GetBookInventoryHandler(c *gin.Context) {
	bookID := c.Param("bookID")
	inventory, err := getInventoryByBookID(bookID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}
	c.JSON(200, inventory)
}
