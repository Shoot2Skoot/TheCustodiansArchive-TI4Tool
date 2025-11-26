/// <reference types="@welldone-software/why-did-you-render" />
import React from 'react';

if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render');
  whyDidYouRender.default(React, {
    trackAllPureComponents: false, // Set to true to track all components (verbose!)
    trackHooks: true,
    logOnDifferentValues: true,
    collapseGroups: true,
  });
}
