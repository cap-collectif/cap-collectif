<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Section;
use Capco\AppBundle\Filter\KnpTranslationFieldFilter;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\SectionRepository;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryEventsResolver;
use Capco\AppBundle\GraphQL\Resolver\Query\QueryVotesResolver;
use Capco\AppBundle\Toggle\Manager;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Overblog\GraphQLBundle\Definition\Argument;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Sonata\AdminBundle\Form\Type\ModelType;

class SectionAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'section';
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'position',
    ];

    public function createQuery($context = 'list')
    {
        $manager = $this->getConfigurationPool()
            ->getContainer()
            ->get(Manager::class);

        $all = $this->getConfigurationPool()
            ->getContainer()
            ->get(SectionRepository::class)
            ->findAll();

        $ids = [];
        foreach ($all as $section) {
            if ($manager->containsEnabledFeature($section->getAssociatedFeatures())) {
                $ids[] = $section->getId();
            }
        }

        $query = parent::createQuery($context);
        $query->andWhere($query->expr()->in($query->getRootAliases()[0] . '.id', ':ids'));
        $query->setParameter('ids', $ids);

        return $query;
    }

    public function getBatchActions(): array
    {
        return [];
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', KnpTranslationFieldFilter::class, [
                'label' => 'global.title',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('teaser', KnpTranslationFieldFilter::class, [
                'label' => 'global.subtitle',
            ])
            ->add('body', KnpTranslationFieldFilter::class, [
                'label' => 'global.contenu',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ]);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->add('move_actions', 'actions', [
                'label' => 'admin.action.highlighted_content.move_actions.label',
                'template' => 'SonataAdminBundle:CRUD:list__action.html.twig',
                'type' => 'action',
                'code' => 'Action',
                'actions' => [
                    'up' => [
                        'template' => 'CapcoAdminBundle:Section:list__action_up.html.twig',
                    ],
                    'down' => [
                        'template' => 'CapcoAdminBundle:Section:list__action_down.html.twig',
                    ],
                ],
            ])
            ->addIdentifier('title', null, [
                'label' => 'global.title',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
                'editable' => true,
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'edit' => [],
                    'delete' => [
                        'template' => 'CapcoAdminBundle:Section:list__action_delete.html.twig',
                    ],
                ],
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $fields = Section::$fieldsForType[$this->getSubject()->getType()];
        $subject = $this->getSubject();

        $formMapper->with('admin.label.settings.global');
        if ($fields['title']) {
            $formMapper->add('title', TextType::class, [
                'label' => 'global.title',
                'required' => false,
                'help' => 'be-concise-1-or-2-words',
            ]);
        } else {
            $formMapper->add('title', TextType::class, [
                'label' => 'global.title',
                'attr' => ['readonly' => true],
            ]);
        }

        if ($fields['teaser']) {
            $formMapper->add('teaser', TextType::class, [
                'label' => 'global.subtitle',
                'required' => false,
                'help' => 'support-your-title',
            ]);
        }

        if ($fields['body']) {
            $formMapper->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ]);
        }

        if ($fields['nbObjects']) {
            $formMapper->add('nbObjects', null, [
                'label' => 'admin.fields.section.nb_objects',
            ]);
        }

        if ($subject && 'proposals' === $subject->getType()) {
            $formMapper->add('step', ModelType::class, [
                'label' => 'global.collect.step.label',
                'required' => true,
                'query' => $this->createQueryForCollectSteps(),
            ]);
        }
        $formMapper->end();

        if ($subject && 'metrics' === $subject->getType()) {
            $args = new Argument(['first' => 100]);

            $votes = $this->getConfigurationPool()
                ->getContainer()
                ->get(QueryVotesResolver::class)
                ->__invoke($args);
            $basicsMetricsLabel =
                $votes->getTotalCount() > 0
                    ? 'admin.fields.section.basicsMetrics'
                    : 'admin.fields.section.basicsMetricsNoVotes';

            $formMapper
                ->with('admin.label.section.display.metrics')
                ->add('metricsToDisplayBasics', null, [
                    'label' => $basicsMetricsLabel,
                ])
                ->add('metricsToDisplayProjects', null, [
                    'label' => 'admin.fields.section.projectsMetrics',
                ]);

            $events = $this->getConfigurationPool()
                ->getContainer()
                ->get(QueryEventsResolver::class)
                ->getEventsConnection($args);
            if ($events->getTotalCount() > 0) {
                $formMapper->add('metricsToDisplayEvents', null, [
                    'label' => 'global.events',
                ]);
            }
            $formMapper->end();
        }

        $formMapper
            ->with('admin.label.section.publication')
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->end();
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('enabled', null, [
                'label' => 'global.published',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('teaser', CKEditorType::class, [
                'label' => 'global.subtitle',
                'config_name' => 'admin_editor',
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add('nbObjects', null, [
                'label' => 'admin.fields.section.nb_objects',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('down', $this->getRouterIdParameter() . '/down');
        $collection->add('up', $this->getRouterIdParameter() . '/up');
    }

    private function createQueryForCollectSteps()
    {
        $qb = $this->getConfigurationPool()
            ->getContainer()
            ->get(CollectStepRepository::class)
            ->createQueryBuilder('cs')
            ->where('cs.isEnabled = :enabled')
            ->setParameter('enabled', true);

        return $qb->getQuery();
    }
}
