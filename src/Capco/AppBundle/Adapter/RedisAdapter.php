<?php

namespace Capco\AppBundle\Adapter;

use Predis\ClientInterface;
use TweedeGolf\PrometheusClient\Storage\AdapterTrait;
use TweedeGolf\PrometheusClient\Storage\StorageAdapterInterface;

class RedisAdapter implements StorageAdapterInterface
{
    use AdapterTrait;

    private $prefix;

    private $redis;

    public function __construct(ClientInterface $redis, $prefix = StorageAdapterInterface::DEFAULT_KEY_PREFIX)
    {
        $this->redis = $redis;
        $this->prefix = $prefix;
    }

    public function getValues($key)
    {
        $keyPrefix = "{$this->prefix}||${key}|*";
        $items = [];
        foreach ($this->redis->keys($keyPrefix) as $entry) {
            // get the value
            $value = $this->redis->get($entry);
            $value = false === $value ? null : (float) $value;

            // get the labels
            list(, , $key, $extra) = explode('|', $entry, 4);
            $labelValuesKey = "{$this->prefix}|" . StorageAdapterInterface::LABEL_PREFIX . "|{$key}|{$extra}";
            $labelData = $this->redis->get($labelValuesKey);

            // check label data
            if (\is_string($labelData) && \strlen($labelData) > 0) {
                $labels = json_decode($labelData);
            } else {
                $labels = [];
            }
            if (!\is_array($labels)) {
                $labels = [];
            }
            $items[] = [$value, $labels];
        }

        return $items;
    }

    public function getValue($key, array $labelValues)
    {
        $this->redis->setnx($this->getKey($key, $labelValues, StorageAdapterInterface::LABEL_PREFIX), json_encode($labelValues));

        $val = $this->redis->get($this->getKey($key, $labelValues));
        if (false === $val) {
            return null;
        }

        return (float) $val;
    }

    public function setValue($key, $value, array $labelValues)
    {
        $this->redis->setnx($this->getKey($key, $labelValues, StorageAdapterInterface::LABEL_PREFIX), json_encode($labelValues));
        $this->redis->set($this->getKey($key, $labelValues), $value);
    }

    public function incValue($key, $inc, $default, array $labelValues)
    {
        $this->redis->setnx($this->getKey($key, $labelValues, StorageAdapterInterface::LABEL_PREFIX), json_encode($labelValues));
        $stored = false;
        $tries = 0;
        $fullKey = $this->getKey($key, $labelValues);
        while (false === $stored) {
            $this->redis->watch($fullKey);
            if (!$this->redis->exists($fullKey)) {
                $this->redis->set($fullKey, \is_callable($default) ? $default() : $default);
                $this->redis->incrbyfloat($fullKey, $inc);
            } else {
                $stored = $this->redis->incrbyfloat($fullKey, $inc);
            }
        }
    }

    public function hasValue($key, array $labelValues)
    {
        return $this->redis->exists($this->getKey($key, $labelValues));
    }

    protected function getPrefix()
    {
        return $this->prefix;
    }
}
