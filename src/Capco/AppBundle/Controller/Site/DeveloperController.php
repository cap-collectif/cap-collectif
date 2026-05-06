<?php

namespace Capco\AppBundle\Controller\Site;

use GraphQL\Type\Definition\EnumType;
use GraphQL\Type\Definition\FieldDefinition;
use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\ScalarType;
use GraphQL\Type\Definition\UnionType;
use Overblog\GraphQLBundle\Resolver\TypeResolver;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DeveloperController extends Controller
{
    public function __construct(
        private readonly TypeResolver $typeResolver
    ) {
    }

    /**
     * @Route("/developer/explorer", name="app_developer_explorer", defaults={"_feature_flags" = "developer_documentation"}, options={"i18n" = false})
     * @Template("@CapcoApp/Developer/explorer.html.twig")
     */
    public function explorerAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/developer/guides/{guide}", name="app_developer_guide", requirements={"guide" = "using-global-node-ids|intro-to-graphql|events|proposals|questionnaires|consultations|projects|delete-account-by-email"}, defaults={"_feature_flags" = "developer_documentation"}, options={"i18n" = false})
     */
    public function guideAction(string $guide)
    {
        return $this->render('@CapcoApp/Developer/guides/' . $guide . '.html.twig');
    }

    /**
     * @Route("/developer/guides", name="app_developer_guides", defaults={"_feature_flags" = "developer_documentation"}, options={"i18n" = false})
     * @Template("@CapcoApp/Developer/guides.html.twig")
     */
    public function guidesAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/developer", name="app_developer", defaults={"_feature_flags" = "developer_documentation"}, options={"i18n" = false})
     * @Route("/developer/{category}", name="app_developer_category", requirements={"category" = "query|previews|breaking_changes|mutation|object|interface|enum|union|input_object|scalar"}, defaults={"_feature_flags" = "developer_documentation"}, options={"i18n" = false})
     * @Route("/developer/{category}/{type}", name="app_developer_category_type", requirements={"category" = "mutation|object|interface|enum|union|input_object|scalar"}, defaults={"_feature_flags" = "developer_documentation"}, options={"i18n" = false})
     * @Template("@CapcoApp/Developer/index.html.twig")
     *
     * @param null|mixed $category
     * @param null|mixed $type
     */
    public function indexAction(
        Request $request,
        ParameterBagInterface $parameters,
        $category = null,
        $type = null
    ) {
        $this->typeResolver->setCurrentSchemaName('public');

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

        $projectDir = $parameters->get('kernel.project_dir');
        $publicSchemaTypeNames = $this->getSchemaTypeNames($projectDir . '/schema.public.graphql');
        $previewSchemaTypeNames = $this->getSchemaTypeNames($projectDir . '/schema.preview.graphql');

        foreach ($this->typeResolver->getSolutions() as $solutionID => $solution) {
            $aliases = $this->typeResolver->getSolutionAliases($solutionID);
            $alias = (string) $aliases[0];
            $solutionName = (string) $solution->name;

            $existsInPublicSchema =
                isset($publicSchemaTypeNames[$solutionName])
                || isset($publicSchemaTypeNames[$alias]);
            $existsInPreviewSchema =
                isset($previewSchemaTypeNames[$solutionName])
                || isset($previewSchemaTypeNames[$alias]);
            $existsOnlyInPreviewSchema = $existsInPreviewSchema && !$existsInPublicSchema;

            // We set info about preview
            $solution->{'preview'} = false;
            if (str_starts_with($alias, 'Preview') || $existsOnlyInPreviewSchema) {
                $solution->{'preview'} = true;
                $solution->{'previewHasAPublicType'} = \in_array(
                    str_replace('Preview', 'Public', $alias),
                    $blackList
                );
            }

            // We remove everything in black list
            if (\in_array($alias, $blackList)) {
                continue;
            }

            // We remove everything not in public or preview schema
            if (
                !\in_array($alias, $publicWhiteList)
                && false === $solution->{'preview'}
                && !str_starts_with($alias, 'Public')
                && !$existsInPublicSchema
            ) {
                continue;
            }

            // We hydrate current selection
            if (($type && $solution->name === $type) || 'query' === $category) {
                if ($solution->{'preview'}) {
                    $publicSelection = $this->typeResolver->getSolutions()[
                        str_replace('Preview', 'Public', $solutionID)
                    ] ?? null;
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
                        $selection = array_values(
                            array_filter($mutation->getFields(), fn (FieldDefinition $field) => $field->name == $type)
                        )[0];
                    }

                    continue;
                }
                // We exclude Payload
                if (str_contains($solution->name, 'Payload')) {
                    continue;
                }
                // We exclude Edge
                if (str_contains($solution->name, 'Edge')) {
                    continue;
                }
                // We exclude Connection
                if (str_contains($solution->name, 'Connection')) {
                    continue;
                }
                $objects[] = $solution;
            }
        }

        // If we could not find the the requested type, let's throw a 404.
        if ($type && !$selection) {
            throw $this->createNotFoundException('The requested type could not be found: ' . $type);
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

    /**
     * @return array<string, true>
     */
    private function getSchemaTypeNames(string $schemaPath): array
    {
        $schema = file_get_contents($schemaPath);
        if (false === $schema) {
            return [];
        }

        preg_match_all(
            '/^(?:type|interface|enum|union|input|scalar)\s+([_A-Za-z][_0-9A-Za-z]*)\b/m',
            $schema,
            $matches
        );

        return array_fill_keys($matches[1], true);
    }
}
