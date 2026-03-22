\# Good and Bad Tests



\## Good Tests



\*\*Integration-style\*\*: Test through real interfaces, not mocks of internal parts.



```typescript

// GOOD: Tests observable behavior

test("user can checkout with valid cart", async () => {

&#x20; const cart = createCart();

&#x20; cart.add(product);

&#x20; const result = await checkout(cart, paymentMethod);

&#x20; expect(result.status).toBe("confirmed");

});

```



Characteristics:



\- Tests behavior users/callers care about

\- Uses public API only

\- Survives internal refactors

\- Describes WHAT, not HOW

\- One logical assertion per test



\## Bad Tests



\*\*Implementation-detail tests\*\*: Coupled to internal structure.



```typescript

// BAD: Tests implementation details

test("checkout calls paymentService.process", async () => {

&#x20; const mockPayment = jest.mock(paymentService);

&#x20; await checkout(cart, payment);

&#x20; expect(mockPayment.process).toHaveBeenCalledWith(cart.total);

});

```



Red flags:



\- Mocking internal collaborators

\- Testing private methods

\- Asserting on call counts/order

\- Test breaks when refactoring without behavior change

\- Test name describes HOW not WHAT

\- Verifying through external means instead of interface



```typescript

// BAD: Bypasses interface to verify

test("createUser saves to database", async () => {

&#x20; await createUser({ name: "Alice" });

&#x20; const row = await db.query("SELECT \* FROM users WHERE name = ?", \["Alice"]);

&#x20; expect(row).toBeDefined();

});



// GOOD: Verifies through interface

test("createUser makes user retrievable", async () => {

&#x20; const user = await createUser({ name: "Alice" });

&#x20; const retrieved = await getUser(user.id);

&#x20; expect(retrieved.name).toBe("Alice");

});

```

