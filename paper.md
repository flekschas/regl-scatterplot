---
title: 'Regl-Scatterplot: A Scalable Interactive JavaScript-based Scatter Plot Library'
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
date: 13 February 2023
bibliography: paper/refs.bib
---

# Summary

Scatter plots are an one of the most popular method for visualizing bivariate
data. They can effectively surface associations like trends or clusters and are
used across all scientific domains. With datasets ever increasing in size, there
is a need for scalable and interactive plotting libraries.

![Examples of `regl-scatterplot`. The top row visualizes the Rössler attractor
and demonstrates the dynamic point opacity. As one zooms in and number of points
in the view decreases, the point opacity increases. The bottom row shows four
embeddings of the Fashion MNIST dataset: PCA, t-SNE, UMAP, and a Variational
Autoencoder. The embeddings are visualized using four `regl-scatterplot`
instances that synchronize their selections and automatically zoom to selected 
points. For instance, as one selects the sky blue group of points in the
top-right instances (highlighted with the white bounding box), the same points
are selected in the other three instances and all four instances zoom to the
selected points (right side of the second row).\label{fig:teaser}](paper/teaser.jpg)

`regl-scatterplot` is a general-purpose data visualization library written in
JavaScript for rendering large-scale scatter plots on the web\autoref{fig:teaser}.
Every aspect of
the library focuses on performance. Thanks to it's WebGL-based renderer, which
is written with `regl` [@regl], the library allows to render up to twenty
million points while offering free pan and zoom. To interact with the data
points, `regl-scatterplot` implements fast lasso selections using a spacial
index [@kdbush]. Beyond the rendering and interaction performance, visualizing
large datasets as scatter plots also poses visualization challenges
[@micallef2017towards]. In particular, the right level of opacity is critical
to faithfully represent the data distribution while ensuring that outliers are
perceivable. To simplify this aspect of the scatter plot design,
`regl-scatterplot` implements an extension of @reusser2022selecting 's
density-based point opacity. In addition to the original approach, the opacity
dynamically adjusts as the user pans and zooms.

# API Design

# Statement of Need

`regl-scatterplot` was designed to be used by visualization researchers and
practitioners. It has already been cited in a number of scientific publications
[@lekschas2020peax; @santala2020fast; @narechania2022vitality;
@bauerle2022symphony; @warchol2023visinity;], it formed the software foundation
for a computer science master thesis [@hindersson2021scatterplot], and is
actively used in scientific software tools [@peax; @histocat; @eodash;
@gotreescape; @jscatter; @visinity; @zeno]. The focus on scalable rendering and
interactions in combinations with the wide variety of design customization in
`regl-scatterplot` enables visualization researchers and practitioners to build,
study, end test new visualization tools and applications for scalable
exploration of the ever-increasing number of large-scale datasets.

# Related & Future Work

There are a number of related JavaScript packages for rendering scatter plots
on the web. General-purpose visualization libraries like `d3` [@bostock2011d3]
or `vega-lite` [@satyanarayan2016vegalite] are broadly useful, but they cannot
render datasets with millions of data points due to their reliance on SVG.
`CandyGraph` [@candygraph] overcomes this limitation by using WebGL for
rendering like `regl-scatterplot`. However, being a general-purpose plotting
library means that it does not offer critical features for exploring scatter
plots interactively like pan-and-zoom, lasso selections, etc. The visualization
charting library `plotly.js` [@plotlyjs] has support for WebGL rendering and
offers interactive pan-or-zoom and lasso selection, but is lacking other
features like animated transitions, dynamic point opacity, or synchronization
of multiple scatter plot instances. Similarly, the bespoke `regl-scatter2d`
[@reglscatter2d] library offers scalable WebGL-based rendering of scatter plots
and allows customizing the point shape. However, it does not support data-driven
visual encodings or interactive point selections. Finally, `deepscatter`
[@deepscatter] is another scalable scatter plot library that offers data-driven
visual encodings. It's reliance on tile-based data enables even greater
scalability compared to `regl-scatterplot` at the expense of having to
preprocess data. Also, as of today, the library is lacking support for lasso
selections or the ability to synchronize multiple scatter plot instances.

In the future, we plan to add built-in support for loading and streaming Apache
Arrow files in `regl-scatterplot` to further improve the performance. We also
plan to move as much or ideally all of `regl-scatterplot` to a web workers,
which would greatly help to avoid any performance impact on the main thread.

# Acknowledgements

We acknowledge contributions from Jeremy A. Prescott, Trevor Manz, and Emlyn
Clay, and Dušan Josipović.
