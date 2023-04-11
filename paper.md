---
title:
  'Regl-Scatterplot: A Scalable Interactive JavaScript-based Scatter Plot
  Library'
tags:
  - scatter plot
  - 2D scatter
  - interactive data visualization
  - JavaScript
  - embedding plot
  - WebGL
authors:
  - name: Fritz Lekschas
    orcid: 0000-0001-8432-4835
    affiliation: 1
affiliations:
  - name: Independent Researcher, USA
    index: 1
date: 14 February 2023
bibliography: paper/refs.bib
---

# Summary

Scatter plots are one of the most popular visualization methods to surface
correlations (like trends or clusters) in bivariate data. They are used across
all scientific domains. With datasets ever increasing in size, it can become
challenging to effectively render and explore scatter plots. Hence, there is a
need for scalable and interactive scatter plot libraries.

![Examples of `regl-scatterplot`. The top row visualizes the Rössler attractor
and demonstrates the dynamic point opacity. As one zooms in (see the white
bounding box) and number of points in the view decreases, the point opacity
increases. The bottom row shows four embeddings of the Fashion MNIST dataset
[@xiao2017fashion] created with PCA [@pearson1901], t-SNE
[@vandermaaten2008visualizing], UMAP [@leland2018umap], and a variational
autoencoder [@kingma2013auto]. The embeddings are visualized using four
`regl-scatterplot` instances that synchronize and zoom to the selected points.
For instance, upon selecting the sky blue cluster of points in the top-right
instance (see the white bounding box), the same points are selected in the other
instances. Also, all four instances zoom to the selected points (right side of
the second row).\label{fig:teaser}](paper/teaser.jpg)

`regl-scatterplot` is a general-purpose data visualization library written in
JavaScript for rendering large-scale scatter plots on the web
(\autoref{fig:teaser}). Every aspect of the library focuses on performance.
Thanks to its WebGL-based renderer, which is written with `regl` [@regl], the
library can draw up to twenty million points while offering smooth pan and zoom.
To interact with the data points, `regl-scatterplot` implements fast lasso
selections using a spatial index [@kdbush].

Beyond the rendering and interaction performance, visualizing large datasets as
scatter plots also poses perceptual challenges [@micallef2017towards]. In
particular, the right level of opacity is critical to faithfully represent the
data distribution while ensuring that outliers are perceivable. To simplify this
aspect of the scatter plot design, `regl-scatterplot` implements a density-based
point opacity that extends an approach by @reusser2022selecting. In addition to
the original approach, the opacity dynamically adjusts to the points within the
field of view as the user pans and zooms. Finally, `regl-scatterplot` supports
drawing spline-interpolated point connections and animated transitions of the
point location and color encoding when drawing a new dataset with point
correspondences (\autoref{fig:additional}).

![Additional features of `regl-scatterplot`. On the left side, we show an
example of point connections rendered as spline-interpolated lines. Note that
connections of selected points are highlighted as well. On the right side, we
show nine key frames of an animated transition of the point locations from a
geographical to a bar chart representation. The points visualize cities across
the globe [@geonames]. The animation example was inspired by
@beshai2017beautiful.
\label{fig:additional}](paper/additional.jpg)

# Statement of Need

`regl-scatterplot` was designed for visualization researchers and practitioners.
It has already been cited in a number of scientific publications
[@lekschas2020peax; @santala2020fast; @narechania2022vitality;
@bauerle2022symphony; @warchol2023visinity], it formed the software foundation
for a computer science master thesis [@hindersson2021scatterplot], and it is
actively used in scientific software tools [@peax; @histocat; @eodash;
@gotreescape; @jscatter; @warchol2023visinity; @cabrera23zeno]. The focus on
scalable rendering and interactions in combinations with a wide variety of
design customizations in `regl-scatterplot` enables visualization researchers
and practitioners to build, study, and test new visualization tools and
applications for scalable exploration of the ever-increasing number of
large-scale datasets.

# Related & Future Work

There are several related JavaScript packages for rendering scatter plots on the
web. General-purpose visualization libraries like `d3` [@bostock2011d3] or
`vega-lite` [@satyanarayan2016vegalite] are broadly useful, but are not well
suited to render datasets with millions of data points due to the reliance on a
Document Object Model (in the case of `d3`) and limited support for GPU-based
rendering. Like `regl-scatterplot`, `CandyGraph` [@candygraph] overcomes this
limitation by using WebGL for the rendering. However, being a general-purpose
plotting library means that `CandyGraph` does not offer critical features for
exploring scatter plots interactively like pan-and-zoom, lasso selections, etc.
The visualization charting library `plotly.js` [@plotlyjs] has support for WebGL
rendering and offers interactive pan-or-zoom and lasso selection, but is lacking
other features like animated transitions, dynamic point opacity, or
synchronization of multiple scatter plot instances. Similarly, the bespoke
`regl-scatter2d` [@reglscatter2d] library offers scalable WebGL-based rendering
of scatter plots and allows customizing the point shape. However, it does not
support data-driven visual encodings or interactive point selections. Finally,
`deepscatter` [@deepscatter] is another scalable scatter plot library that
offers data-driven visual encodings. Its reliance on tile-based data enables
even greater scalability compared to `regl-scatterplot` but at the expense of
having to preprocess data. Also, as of today, the library is lacking support for
lasso selections or the ability to synchronize multiple scatter plot instances.

In the future, we plan to add built-in support for streaming tiled Apache Arrow
files in `regl-scatterplot` to further improve the performance. We also plan to
move as much or ideally all of `regl-scatterplot`'s code to web workers, which
would help to avoid any performance impact on the main thread.

# Acknowledgements

We acknowledge contributions from Jeremy A. Prescott, Trevor Manz, and Emlyn
Clay, and Dušan Josipović.

# References
