# API Reference

This is a detailed list of the methods and options available in the SDK.

## Class: InstaChecker

### Constructor

```typescript
new InstaChecker(options?)
```

Creates a new checker instance.

**Parameters:**

*   `options` (Object): Optional configuration object.

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `timeout` | number | 5000 | Request timeout in ms. |
| `concurrency` | number | 5 | Number of parallel requests allowed. |
| `retries` | number | 2 | Number of times to retry a failed request. |
| `cacheTTL` | number | 300000 | Cache time to live in ms. |
| `enableCache` | boolean | true | Enable or disable the memory cache. |

### Method: checkUsername

Checks if a single username is available.

```typescript
checkUsername(username: string): Promise<CheckResult>
```

**Parameters:**

*   `username` (string): The Instagram username to check.

**Returns:**

A Promise that resolves to a `CheckResult` object:

```typescript
{
    available: boolean, // true if available, false if taken
    cached: boolean     // true if result came from memory cache
}
```

**Throws:**

Throws an Error if the username is invalid or if the request fails after all retries.

### Method: checkBatch

Checks multiple usernames in parallel.

```typescript
checkBatch(usernames: string[], options?: BatchOptions): Promise<Record<string, boolean | null>>
```

**Parameters:**

*   `usernames` (string[]): An array of username strings.
*   `options` (Object): Optional settings.
    *   `onProgress` (function): A callback function that fires every time a username finishes.

**Returns:**

A Promise that resolves to an object where keys are usernames and values are booleans (`true`, `false`) or `null` if an error occurred.

**Example:**

```javascript
const results = await checker.checkBatch(['a', 'b', 'c'], {
    onProgress: (info) => {
        console.log(`${info.current}/${info.total} done`);
    }
});
```

### Method: clearCache

Clears all items from the in-memory cache.

```typescript
clearCache(): void
```

Use this if you want to ensure all subsequent checks hit the live API.
