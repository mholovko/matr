# MatR - Material Register

Digital registry for post-carbon construction. Track materials, plan renovations, and compare cost vs. embodied carbon tradeoffs through 3D building visualization.

**By**: Center for Spatial Technologies × Dark Matter Labs

## Features

- **3D Building Inventory** - Interactive model with material data
- **Element Filtering** - Filter by category, level, material, systems
- **Performance Monitoring** - Indoor air quality, temperature, humidity tracking
- **Retrofit Planning** - Renovation scenarios with cost + carbon metrics
- **Activity Feed** - Project milestones and survey events

## Quick Start

```bash
bun install
cp .env.local.example .env.local  # Configure Speckle credentials
bun dev
```

## Tech Stack

Next.js 16 • React 19 • Three.js • Speckle BIM • Zustand • Tailwind CSS

## Data Status

| Feature | Status |
|---------|--------|
| **Building Geometry & Materials** | ✅ Real (Speckle API) |
| **Retrofit Scopes** | 🔄 Mock (development) |
| **Performance Metrics** | 🔄 Mock (development) |
| **Energy Consumption** | ❌ Pending (smart meters) |
| **Carbon Database** | ❌ Pending (ICE/material coefficients) |

## Project Structure

```
app/           # Pages: inventory, retrofit, performance, feed
components/    # Canvas (3D), dashboard, UI components
lib/           # Speckle integration, state, mock data
```

## Resources

- [Spatial Tech - MatR Project](https://www.spatialtech.info/en/works/matr/)
- [Dark Matter Labs Research](https://provocations.darkmatterlabs.org/datas-role-for-a-post-carbon-built-environment-7a31b4ebc934)
- [Speckle Docs](https://speckle.systems/)

## License

MIT License - See [LICENSE](LICENSE) file for details.
