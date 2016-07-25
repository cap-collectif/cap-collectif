<?php

namespace Capco\AppBundle\UrlResolver;

class Route
{
    /**
     * Route's name.
     *
     * @var string
     */
    protected $name;

    /**
     * Route's parameters.
     *
     * @var array
     */
    protected $parameters;

    /**
     * ABSOLUTE or RELATIVE.
     *
     * @var int
     */
    protected $path = 0;

    /**
     * Route constructor.
     *
     * @param string $name
     * @param array  $parameters
     * @param int    $path
     */
    public function __construct($name = '', array $parameters = [], $path = 0)
    {
        $this->name = $name;
        $this->parameters = $parameters;
        $this->path = $path;
    }

    /**
     * @return string
     */
    public function getName(): string
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName(string $name)
    {
        $this->name = $name;
    }

    /**
     * @return array
     */
    public function getParameters(): array
    {
        return $this->parameters;
    }

    /**
     * @param array $parameters
     */
    public function setParameters(array $parameters)
    {
        $this->parameters = $parameters;
    }

    /**
     * @return int
     */
    public function getPath(): int
    {
        return $this->path;
    }

    /**
     * @param int $path
     */
    public function setPath(int $path)
    {
        $this->path = $path;
    }
}
