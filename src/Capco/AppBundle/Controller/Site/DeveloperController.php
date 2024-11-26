<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Cache\RedisCache;
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
use Symfony\Component\Cache\Adapter\AdapterInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DeveloperController extends Controller
{
    final public const CACHE_KEY = 'DeveloperController';
    private readonly AdapterInterface $cache;
    private readonly TypeResolver $typeResolver;

    public function __construct(AdapterInterface $cacheApp, TypeResolver $typeResolver)
    {
        $this->cache = $cacheApp;
        $this->typeResolver = $typeResolver;
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
        $cachedItem = $this->cache->getItem(self::CACHE_KEY);
        if (!$cachedItem->isHit()) {
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

            foreach ($this->typeResolver->getSolutions() as $solutionID => $solution) {
                $aliases = $this->typeResolver->getSolutionAliases($solutionID);

                $existsInPreviewDirectory =
                    (new Finder())
                        ->files()
                        ->name($aliases[0] . '.types.yaml')
                        ->in([
                            $parameters->get('kernel.project_dir') .
                            '/src/Capco/AppBundle/Resources/config/graphql/preview/',
                        ])
                        ->count() > 0;
                $existsInPublicDirectory =
                    (new Finder())
                        ->files()
                        ->name($aliases[0] . '.types.yaml')
                        ->in([
                            $parameters->get('kernel.project_dir') .
                            '/src/Capco/AppBundle/Resources/config/graphql/public/',
                        ])
                        ->count() > 0;

                // We set info about preview
                $solution->{'preview'} = false;
                if ('Preview' === substr((string) $aliases[0], 0, 7) || $existsInPreviewDirectory) {
                    $solution->{'preview'} = true;
                    $solution->{'previewHasAPublicType'} = \in_array(
                        str_replace('Preview', 'Public', (string) $aliases[0]),
                        $blackList
                    );
                }

                // We remove everything in black list
                if (\in_array($aliases[0], $blackList)) {
                    continue;
                }

                // We remove everything not in public or preview schema
                if (
                    !\in_array($aliases[0], $publicWhiteList)
                    && false === $solution->{'preview'}
                    && 'Public' !== substr((string) $aliases[0], 0, 6)
                    && (!$existsInPreviewDirectory && !$existsInPublicDirectory)
                ) {
                    continue;
                }

                // We hydrate current selection
                if (($type && $solution->name === $type) || 'query' === $category) {
                    if ($solution->{'preview'}) {
                        $publicSelection = isset(
                            $this->typeResolver->getSolutions()[
                                str_replace('Preview', 'Public', $solutionID)
                            ]
                        )
                            ? $this->typeResolver->getSolutions()[
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

            // If we could not find the the requested type, let's throw a 404.
            if ($type && !$selection) {
                throw $this->createNotFoundException('The requested type could not be found: ' . $type);
            }

            $data = [
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

            $cachedItem->set($data)->expiresAfter(RedisCache::ONE_DAY);
            $this->cache->save($cachedItem);
        }

        return $cachedItem->get();
    }
}
