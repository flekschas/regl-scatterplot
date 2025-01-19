import {
  bindValue,
  createPlugin,
  parseRecord,
  BladeApi,
  BladeController,
  ValueMap
} from '@tweakpane/core';

class LinkController extends BladeController {
  constructor(doc, config) {
    super({
      ...config,
      view: new LinkView(doc, {
        props: config.props,
        viewProps: config.viewProps,
      }),
    });
  }
}

class LinkView {
  constructor(doc, { props, viewProps }) {
    // Create view elements
    this.element = doc.createElement('div');
    this.element.classList.add('tp-link');
    viewProps.bindClassModifiers(this.element);

    // Create an `a` element for user interaction
    const linkElement = doc.createElement('a');
    viewProps.bindDisabled(linkElement);

    function setLink(link) {
      linkElement.href = link ?? '';
    }

    function setLabel(label) {
      linkElement.textContent = label ?? '';
    }

    function setActive(active) {
      if (active) {
        linkElement.classList.add('active');
        linkElement.removeAttribute('href');
        linkElement.removeAttribute('target');
      } else {
        linkElement.classList.remove('active');
        setLink(props.get('link'));
        setNewPage(props.get('newPage'));
      }
    }

    function setNewPage(newPage) {
      if (newPage) {
        linkElement.target = '_blank';
      } else {
        linkElement.removeAttribute('target');
      }
    }

    bindValue(props.value('link'), setLink);
    bindValue(props.value('label'), setLabel);
    bindValue(props.value('active'), setActive);
    bindValue(props.value('newPage'), setNewPage);

    this.element.appendChild(linkElement);
    this.linkElement = linkElement;
  }
}

class LinkApi extends BladeApi {
  get label() {
    return this.controller.props.get('label') ?? '';
  }

  set label(label) {
    this.controller.props.set('label', label);
  }

  get link() {
    return this.controller.props.get('link');
  }

  set link(link) {
    this.controller.props.set('link', link);
  }

  get active() {
    return this.controller.props.get('active');
  }

  set active(active) {
    this.controller.props.set('active', Boolean(active));
  }

  get newPage() {
    return this.controller.props.get('newPage');
  }

  set newPage(newPage) {
    this.controller.props.set('newPage', Boolean(newPage));
  }
}

export const LinkPlugin = createPlugin({
  id: 'link',
  type: 'blade',
  accept(params) {
    const result = parseRecord(params, (p) => ({
      view: p.required.constant('link'),
      link: p.required.string,
      label: p.required.string,
      active: p.optional.boolean,
      newPage: p.optional.boolean,
    }));
    return result ? { params: result } : null;
  },
  controller(args) {
    return new LinkController(args.document, {
      blade: args.blade,
      props: ValueMap.fromObject({
        label: args.params.label,
        link: args.params.link,
        active: args.params.active,
        newPage: args.params.newPage,
      }),
      viewProps: args.viewProps,
    });
  },
  api(args) {
    if (!(args.controller instanceof LinkController)) {
      return null;
    }
    return new LinkApi(args.controller);
  },
});
