---
layout: default
title: Home
nav_order: 1
permalink: /
---

# comp-sys
{: .fs-9 }

This is a personal blog. The website is based on the Jekyll theme [Just the Docs](https://github.com/pmarsceill/just-the-docs). This blog intends to be a introduction to computer science. There are enormous userful links and some technique details for some specific fields.

#### Thank you to the contributors of Just the Docs!

[See configuration options]({{ site.baseurl }}{% link docs/system/system.md %})

<ul class="list-style-none">
{% for contributor in site.github.contributors %}
  <li class="d-inline-block mr-1">
     <a href="{{ contributor.html_url }}"><img src="{{ contributor.avatar_url }}" width="32" height="32" alt="{{ contributor.login }}"/></a>
  </li>
{% endfor %}
</ul>

