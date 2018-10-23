<?php
namespace Capco\AppBundle\Controller\Site;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\UnionType;
use GraphQL\Type\Definition\EnumType;

class DeveloperController extends Controller
{
    /**
     * @Route("/developer/explorer/", name="app_developer_explorer", defaults={"_feature_flags" = "developer_documentation"})
     * @Template("CapcoAppBundle:Developer:explorer.html.twig")
     */
    public function explorerAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/developer", name="app_developer", defaults={"_feature_flags" = "developer_documentation"})
     * @Route("/developer/{category}/", name="app_developer_category", requirements={"category" = "query|previews|breaking_changes"}, defaults={"_feature_flags" = "developer_documentation"})
     * @Route("/developer/{category}/{selection}", name="app_developer_category_type", requirements={"category" = "mutation|object|interface|enum|union|input_object|scalar"}, defaults={"_feature_flags" = "developer_documentation"})
     * @Template("CapcoAppBundle:Developer:index.html.twig")
     */
    public function indexAction(Request $request, $category = null, $selection = null)
    {
        $typeResolver = $this->get('overblog_graphql.type_resolver');
        $typeResolver->setCurrentSchemaName('public');

        $scalars = [];
        $objects = [];
        $interfaces = [];
        $enums = [];
        $unions = [];
        $input_objects = [];
        $query = null;
        $mutation = null;

        foreach ($typeResolver->getSolutions() as $solutionID => $solution) {
            $aliases = $typeResolver->getSolutionAliases($solutionID);

            // We set info about preview
            $solution->{'preview'} = false;
            if (substr($aliases[0], 0, 7) === 'Preview') {
                $solution->{'preview'} = true;
            }

            // All scalars are considered public
            if ($solution instanceof ScalarType) {
                $scalars[] = $solution;
                continue;
            }

            // We remove everything not in public or preview schema
            if ($solution->{'preview'} === false && substr($aliases[0], 0, 6) !== 'Public') {
                continue;
            }

            if ($solution instanceof EnumType) {
                $enums[] = $solution;
            } elseif ($solution instanceof UnionType) {
                $unions[] = $solution;
            } elseif ($solution instanceof InterfaceType) {
                $interfaces[] = $solution;
            } elseif ($solution instanceof InputObjectType) {
                $input_objects[] = $solution;
            } elseif ($solution instanceof ObjectType) {
                // Special types
                if ($solution->name === 'Query') {
                    // We display PreviewQuery
                    if ($solution->{'preview'}) {
                        $query = $solution;
                    }
                    continue;
                }
                if ($solution->name === 'Mutation') {
                    $mutation = $solution;
                    continue;
                }
                // We exclude Payload
                if (strpos($solution->name, 'Payload') !== false) {
                    continue;
                }
                // We exclude Edge
                if (strpos($solution->name, 'Edge') !== false) {
                    continue;
                }
                // We exclude Connection
                if (strpos($solution->name, 'Connection') !== false) {
                    continue;
                }
                $objects[] = $solution;
            }
        }

        return [
            'selection' => $selection,
            'category' => $category,
            'query' => $query,
            'unions' => $unions,
            'input_objects' => $input_objects,
            'enums' => $enums,
            'interfaces' => $interfaces,
            'objects' => $objects,
            'scalars' => $scalars,
            'mutation' => $mutation,
        ];
    }
}
