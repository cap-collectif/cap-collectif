<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\UnionType;
use GraphQL\Type\Definition\EnumType;
use GraphQL\Type\Definition\FieldDefinition;

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
     * @Route("/developer/guides/{slug}", name="app_developer_guide", defaults={"_feature_flags" = "developer_documentation"})
     */
    public function guideAction(string $slug)
    {
        return $this->render('CapcoAppBundle:Developer:guides/' . $slug . '.html.twig');
    }

    /**
     * @Route("/developer/guides/", name="app_developer_guides", defaults={"_feature_flags" = "developer_documentation"})
     * @Template("CapcoAppBundle:Developer:guides.html.twig")
     */
    public function guidesAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/developer", name="app_developer", defaults={"_feature_flags" = "developer_documentation"})
     * @Route("/developer/{category}/", name="app_developer_category", requirements={"category" = "query|previews|breaking_changes"}, defaults={"_feature_flags" = "developer_documentation"})
     * @Route("/developer/{category}/{type}", name="app_developer_category_type", requirements={"category" = "mutation|object|interface|enum|union|input_object|scalar"}, defaults={"_feature_flags" = "developer_documentation"})
     * @Template("CapcoAppBundle:Developer:index.html.twig")
     */
    public function indexAction(Request $request, $category = null, $type = null)
    {
        $typeResolver = $this->get('overblog_graphql.type_resolver');
        $typeResolver->setCurrentSchemaName('public');

        $selection = null;

        $scalars = [];
        $objects = [];
        $interfaces = [];
        $enums = [];
        $unions = [];
        $input_objects = [];
        $query = null;
        $mutation = null;

        // Public types with Preview types should be here :
        $blackList = [
            'PublicQuery',
            'PublicQuestionnaire',
            'PublicUser',
            'PublicProject',
            'PublicConsultation',
            'PublicUserConnection',
        ];

        // Public types hard to guess :
        $publicWhiteList = [
            'OrderDirection',
            'Trashable',
            'TrashableStatus',
            'NotPublishedReason',
            'UniformResourceLocatable',
            'UserError',
            'PageInfo',
            'Node',
            'String',
            'Int',
            'Float',
            'Boolean',
            'ID',
            'HTML',
            'Email',
            'DateTime',
            'URI',
        ];
        foreach ($typeResolver->getSolutions() as $solutionID => $solution) {
            $aliases = $typeResolver->getSolutionAliases($solutionID);

            // We set info about preview
            $solution->{'preview'} = false;
            if ('Preview' === substr($aliases[0], 0, 7)) {
                $solution->{'preview'} = true;
                $solution->{'previewHasAPublicType'} = \in_array(
                    str_replace('Preview', 'Public', $aliases[0]),
                    $blackList
                );
            }

            // We remove everything in black list
            if (\in_array($aliases[0], $blackList)) {
                continue;
            }

            // We remove everything not in public or preview schema
            if (
                !\in_array($aliases[0], $publicWhiteList) &&
                false === $solution->{'preview'} &&
                'Public' !== substr($aliases[0], 0, 6)
            ) {
                continue;
            }

            // We hydrate current selection
            if (($type && $solution->name === $type) || 'query' === $category) {
                if ($solution->{'preview'}) {
                    $publicSelection = isset(
                        $typeResolver->getSolutions()[str_replace('Preview', 'Public', $solutionID)]
                    )
                        ? $typeResolver->getSolutions()[
                            str_replace('Preview', 'Public', $solutionID)
                        ]
                        : null;
                    $solution->{'publicSelection'} = $publicSelection;
                }
                $selection = $solution;
            }

            if ($solution instanceof EnumType) {
                $enums[] = $solution;
            } elseif ($solution instanceof ScalarType) {
                $scalars[] = $solution;
            } elseif ($solution instanceof UnionType) {
                $unions[] = $solution;
            } elseif ($solution instanceof InterfaceType) {
                $interfaces[] = $solution;
            } elseif ($solution instanceof InputObjectType) {
                $input_objects[] = $solution;
            } elseif ($solution instanceof ObjectType) {
                // Special types
                if ('Query' === $solution->name) {
                    // We display PreviewQuery
                    if ($solution->{'preview'}) {
                        $query = $solution;
                    }

                    continue;
                }
                if ('Mutation' === $solution->name) {
                    $mutation = $solution;

                    // We hydrate current selection for mutations.
                    if ('mutation' === $category && $type) {
                        // die();
                        $selection = array_values(
                            array_filter($mutation->getFields(), function (
                                FieldDefinition $field
                            ) use ($type) {
                                return $field->name == $type;
                            })
                        )[0];
                    }

                    continue;
                }
                // We exclude Payload
                if (false !== strpos($solution->name, 'Payload')) {
                    continue;
                }
                // We exclude Edge
                if (false !== strpos($solution->name, 'Edge')) {
                    continue;
                }
                // We exclude Connection
                if (false !== strpos($solution->name, 'Connection')) {
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
