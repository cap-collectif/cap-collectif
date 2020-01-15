<?php

namespace Capco\AppBundle\Behat\Storage;

class BehatStorage
{
    static protected $instance;

    protected $storage = [];

    static public function getInstance(): self
    {
        if (!self::$instance) {
            self::$instance = new static;
        }
        return self::$instance;
    }

    static public function __callStatic($method, $args)
    {
        $instance = static::getInstance();
        return call_user_func_array([$instance, '_' . $method], $args);
    }

    public function _get(string $key): ?string
    {
        return $this->storage[$key] ?? null;
    }

    public function _set(string $name, string $value): void
    {
        $this->storage[$name] = $value;
    }

    public function _clear(): void
    {
        $this->storage = [];
    }
}
