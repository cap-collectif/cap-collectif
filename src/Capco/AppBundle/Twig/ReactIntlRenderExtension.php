<?php

namespace Capco\AppBundle\Twig;

use Limenius\ReactBundle\Twig\ReactRenderExtension;

class ReactIntlRenderExtension extends \Twig_Extension
{
    private $extension;
    private $messages;

    /**
     * Constructor
     */
    public function __construct(ReactRenderExtension $extension, $file)
    {
        $this->extension = $extension;
        $this->messages = json_decode(file_get_contents($file), true);
    }

    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('react_intl_component', [$this, 'reactRenderIntlComponent'], ['is_safe' => ['html']]),
        ];
    }

    public function reactRenderIntlComponent($componentName, $options = [])
    {
        if (!array_key_exists('props', $options)) {
          $options['props'] = [];
        }
        if (is_string($options['props'])) {
          $props = json_decode($options['props'], true);
          $props['messages'] = $this->messages;
          $options['props'] = $props;
        } else {
          $options['props']['messages'] = $this->messages;
        }
        return $this->extension->reactRenderComponent($componentName, $options);
    }

    public function getName()
    {
        return 'react_render_intl_extension';
    }
}
