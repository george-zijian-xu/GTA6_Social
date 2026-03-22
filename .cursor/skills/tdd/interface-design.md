\# Interface Design for Testability



Good interfaces make testing natural:



1\. \*\*Accept dependencies, don't create them\*\*



&#x20;  ```typescript

&#x20;  // Testable

&#x20;  function processOrder(order, paymentGateway) {}



&#x20;  // Hard to test

&#x20;  function processOrder(order) {

&#x20;    const gateway = new StripeGateway();

&#x20;  }

&#x20;  ```



2\. \*\*Return results, don't produce side effects\*\*



&#x20;  ```typescript

&#x20;  // Testable

&#x20;  function calculateDiscount(cart): Discount {}



&#x20;  // Hard to test

&#x20;  function applyDiscount(cart): void {

&#x20;    cart.total -= discount;

&#x20;  }

&#x20;  ```



3\. \*\*Small surface area\*\*

&#x20;  - Fewer methods = fewer tests needed

&#x20;  - Fewer params = simpler test setup

