<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Resolver\UrlResolver;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\NonNull;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\UnionType;
use GraphQL\Type\Definition\EnumType;
use GraphQL\Type\Definition\ListOfType;
use Symfony\Component\Routing\Router;

class UrlExtension extends \Twig_Extension
{
    protected $urlResolver;
    protected $router;

    public function __construct(UrlResolver $urlResolver, Router $router)
    {
        $this->urlResolver = $urlResolver;
        $this->router = $router;
    }

    public function getFilters(): array
    {
        return [
            new \Twig_SimpleFilter('usort', [$this, 'getUsort']),
            new \Twig_SimpleFilter('graphql_description', [$this, 'formatDescription']),
            new \Twig_SimpleFilter('capco_url', [$this, 'getObjectUrl']),
            new \Twig_SimpleFilter('capco_admin_url', [$this, 'getAdminObjectUrl']),
            new \Twig_SimpleFilter('capco_developer_type_url', [$this, 'getDeveloperTypeUrl']),
        ];
    }

    public function formatDescription(string $string): string
    {
        // We replace `pattern` by italic format (<i>pattern</i>)
        return preg_replace('/(`(.*?)`)/', '<i>\\2</i>', $string);
    }

    public function getUsort(array $data, string $property = 'name')
    {
        usort($data, function ($data1, $data2) use ($property) {
            if ($data1->$property == $data2->$property) {
                return 0;
            }

            return $data1->$property < $data2->$property ? -1 : 1;
        });

        return $data;
    }

    public function getDeveloperTypeUrl(Type $data): string
    {
        // Remove NonNull (!)
        if ($data instanceof NonNull) {
            $data = $data->getWrappedType();
        }

        // Remove Array
        if ($data instanceof ListOfType) {
            $data = $data->getWrappedType();
        }

        // Remove NonNull (!)
        if ($data instanceof NonNull) {
            $data = $data->getWrappedType();
        }

        $type = $data->name;
        $category = null;
        if ($data instanceof EnumType) {
            $category = 'enum';
        } elseif ($data instanceof ScalarType) {
            $category = 'scalar';
        } elseif ($data instanceof UnionType) {
            $category = 'union';
        } elseif ($data instanceof InterfaceType) {
            $category = 'interface';
        } elseif ($data instanceof InputObjectType) {
            $category = 'input_object';
        } elseif ($data instanceof ObjectType) {
            $category = 'object';
        }

        return $this->router->generate('app_developer_category_type', compact('category', 'type'));
    }

    public function getObjectUrl($object, $absolute = false)
    {
        return $this->urlResolver->getObjectUrl($object, $absolute);
    }

    public function getAdminObjectUrl($object, $absolute = false)
    {
        return $this->urlResolver->getAdminObjectUrl($object, $absolute);
    }
}
