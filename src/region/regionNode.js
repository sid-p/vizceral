/**
 *
 *
 */
import FocusedNodeView from '../focused/focusedNodeView';
import Node from '../base/node';
import NodeViewStandard from '../base/nodeViewStandard';
import NodeViewStorage from '../base/nodeViewStorage';
import NodeViewPipe from '../base/nodeViewPipe';

class RegionNode extends Node {
  constructor (node) {
    node.size = node.size || 60;
    super(node, 'region');
    this.loaded = true;
  }

  isDraggable () {
    return true;
  }

  isInteractive () {
    return true;
  }

  findViewFor () {
    switch (this.node_type) {
    case 'service':
      return new NodeViewStandard(this);
    case 'storage':
      return new NodeViewStorage(this);
    case 'pipe':
      return new NodeViewPipe(this);
    default:
      return new NodeViewStandard(this);
    }
  }

  render () {
    // Set the default view renderer
    if (this.nodeView === 'focused') {
      this.view = new FocusedNodeView(this);
    } else {
      this.view = this.findViewFor();
    }
  }
}

export default RegionNode;
