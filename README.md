# Covid Stats Ireland: [covidnumbers.hop.ie](https://covidnumbers.hop.ie)

This is a Covid dashboard designed to provide an overview of the currently available stats for Ireland.

View it here: [https://covidnumbers.hop.ie](https://covidnumbers.hop.ie)

I've tried to make it easy to see the current state of Covid in the country, with case totals, hospital totals, testing percentages and vaccination numbers. It also offers a historical view by surfacing daily numbers when hovering over the two main time-based graphs.

You can also dig into county-based data which has been illustrated as a percentage of each county's population along with corresponding county case numbers.

## Latest numbers

![Latest Covid numbers](https://covidnumbers.hop.ie/covid-stats-ireland.png)

## How it was built

The charts are put together from data provided by [data.gov.ie](https://data.gov.ie/) and [Our World In Data](https://github.com/owid/covid-19-data/tree/master/public/data).

This data is pulled in to an [Eleventy](https://www.11ty.dev/) project which renders static HTML of the graphs using [D3](https://d3js.org/). The server-rendered static HTML is then hosted on [Github Pages](https://pages.github.com) and the deployment process is handled by [Github Actions](https://github.com/features/actions).

An Action runs several times each day on a schedule to ensure the data is current.

The graphs are pre-rendered so that as little data as possible needs to be sent to the browser before they can be seen, resulting in a faster load time and no requirement for JavaScript to access the data.

## Running locally

To run this project locally, clone the repo, `cd` into the resulting folder and install with `npm` or `yarn`.

```
npm i
```

You can then run the project with:

```
npm run dev
```

## Caching data

On first run, the project will cache the API data locally in a `cached.json` file. This will then be used for subsequent runs to save hitting the APIs all the time. You can delete this file and run the `npm run dev` command to re-generate it. It is not used in production.

## Attribution

If you use this project or any of the graphs, please link back to [the source](https://covidnumbers.hop.ie), using something like:

_Source: [CovidNumbers.hop.ie](https://covidnumbers.hop.ie) by Donovan Hutchinson_

## Questions and feedback

Any issues, please let me know [by email](mailto:d@hop.ie) or [on Twitter](https://twitter.com/donovanh).

## License

MIT license applies.
