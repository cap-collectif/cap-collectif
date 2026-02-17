<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\GraphQL\Resolver\Locale\GraphQLLocaleResolver;
use Capco\AppBundle\Model\TranslatableInterface;
use Closure;
use GraphQL\Type\Definition\ResolveInfo;

class LocaleAwareFieldResolver
{
    private const PREFIXES = ['get', 'is', 'has', ''];

    /**
     * @var array<string, bool>
     */
    private array $methodSupportsLocaleCache = [];

    public function __construct(private readonly GraphQLLocaleResolver $graphqlLocaleResolver)
    {
    }

    /**
     * @return null|mixed
     */
    public function __invoke(mixed $parentValue, mixed $args, mixed $context, ResolveInfo $info)
    {
        $fieldName = $info->fieldName;

        if (\is_array($parentValue) && \array_key_exists($fieldName, $parentValue)) {
            $value = $parentValue[$fieldName];

            return $value instanceof Closure ? $value($parentValue, $args, $context, $info) : $value;
        }

        if (!\is_object($parentValue)) {
            return null;
        }

        $method = $this->resolveMethod($parentValue, $fieldName);
        if (null !== $method) {
            if (
                $parentValue instanceof TranslatableInterface
                && $this->methodSupportsLocaleArgument($parentValue, $method)
            ) {
                $locale = $this->graphqlLocaleResolver->resolve($args);

                return $parentValue->{$method}($locale);
            }

            return $parentValue->{$method}();
        }

        return $parentValue->{$fieldName} ?? null;
    }

    private function resolveMethod(object $object, string $fieldName): ?string
    {
        foreach (self::PREFIXES as $prefix) {
            $method = $prefix . str_replace('_', '', $fieldName);
            if (\is_callable([$object, $method])) {
                return $method;
            }
        }

        return null;
    }

    private function methodSupportsLocaleArgument(object $object, string $method): bool
    {
        $cacheKey = $object::class . '::' . $method;
        if (isset($this->methodSupportsLocaleCache[$cacheKey])) {
            return $this->methodSupportsLocaleCache[$cacheKey];
        }

        try {
            $reflectionMethod = new \ReflectionMethod($object, $method);
            $parameters = $reflectionMethod->getParameters();
            $requiredParametersCount = $reflectionMethod->getNumberOfRequiredParameters();

            $supportsLocale = [] !== $parameters
                && 'locale' === $parameters[0]->getName()
                && $requiredParametersCount <= 1;
            $this->methodSupportsLocaleCache[$cacheKey] = $supportsLocale;

            return $supportsLocale;
        } catch (\ReflectionException) {
            $this->methodSupportsLocaleCache[$cacheKey] = false;

            return false;
        }
    }
}
