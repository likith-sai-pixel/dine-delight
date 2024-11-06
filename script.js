document.addEventListener('DOMContentLoaded', function () {
    let cart = []; // Initialize an empty cart array

    // Function to update cart display and calculate total
    function updateCart() {
        let totalAmount = 0;
        cart.forEach(item => {
            totalAmount += item.price * item.quantity; // Calculate the total cart value
        });

        console.log("Cart Total:", totalAmount); // Debugging the total amount
        return totalAmount; // Return total amount to use it when needed
    }

    // Add items to the cart
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const menuItemDiv = button.parentElement;
            const itemName = menuItemDiv.querySelector('h3').textContent;
            const itemPrice = parseFloat(menuItemDiv.querySelector('p').textContent.replace('Price: ₹', '').replace(/,/g, ''));

            // Debugging the parsed price
            console.log(`Item: ${itemName}, Parsed Price: ₹${itemPrice}`);

            // Check if item already exists in the cart
            const existingItem = cart.find(item => item.name === itemName);
            if (existingItem) {
                existingItem.quantity++; // If item exists, increase its quantity
            } else {
                cart.push({ name: itemName, price: itemPrice, quantity: 1 }); // Otherwise, add a new item to the cart
            }

            console.log(cart); // Debugging cart items
        });
    });

    // Proceed to Payment button click handler
    const proceedToPaymentButton = document.getElementById('proceed-to-payment');
    proceedToPaymentButton.addEventListener('click', () => {
        const totalAmount = updateCart(); // Get the total cart value

        if (totalAmount > 0) {
            // Redirect to qr.html with the total as a URL parameter
            window.location.href = `qr.html?total=${totalAmount.toFixed(2)}`;
        } else {
            alert("Your cart is empty!"); // Handle empty cart case
        }
    });
});

