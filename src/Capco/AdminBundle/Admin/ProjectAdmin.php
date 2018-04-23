<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Project;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;

class ProjectAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $cover = $object->getCover();
        if ($cover) {
            $provider = $this->getConfigurationPool()->getContainer()->get($cover->getProviderName());
            $format = $provider->getFormatName($cover, 'form');
            $url = $provider->generatePublicUrl($cover, $format);

            return new Metadata($object->getTitle(), null, $url);
        }

        return parent::getObjectMetadata($object);
    }

    public function getExportFormats(): array
    {
        return [];
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.project.title',
            ])
            ->add('Author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.project.author',
            ], null, [
                'property' => 'username',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $datagridMapper->add('themes', null, [
                'label' => 'admin.fields.project.themes',
            ]);
        }

        $datagridMapper
            ->add('steps', null, [
                'label' => 'admin.fields.project.steps',
            ])
            ->add('events', null, [
                'label' => 'admin.fields.project.events',
            ])
            ->add('posts', null, [
                'label' => 'admin.fields.project.posts',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.project.is_enabled',
            ])
            ->add('exportable', null, [
                'label' => 'admin.fields.project.exportable',
            ])
            ->add('publishedAt', null, [
                'label' => 'admin.fields.project.published_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.project.updated_at',
            ])
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
            ])
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.project.title',
            ])
            ->add('Author', 'sonata_type_model', [
                'label' => 'admin.fields.project.author',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $listMapper->add('themes', null, [
                'label' => 'admin.fields.project.themes',
            ]);
        }

        $listMapper
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.project.is_enabled',
            ])
            ->add('exportable', null, [
                'editable' => true,
                'label' => 'admin.fields.project.exportable',
            ])
            ->add('publishedAt', null, [
                'label' => 'admin.fields.project.published_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'download' => [
                      'template' => 'CapcoAdminBundle:CRUD:list__action_download.html.twig',
                    ],
                    'delete' => ['template' => 'CapcoAdminBundle:CRUD:list__action_delete.html.twig'],
                ],
            ])
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.project.group_content', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.project.group_meta', ['class' => 'col-md-6'])->end()
            ->with('admin.fields.project.group_ranking', ['class' => 'col-md-6'])->end()
            ->with('admin.fields.project.group_steps', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.project.advanced', ['class' => 'col-md-12'])->end()
        ;

        $formMapper
            // Content
            ->with('admin.fields.project.group_content')
            ->add('title', null, [
                'label' => 'admin.fields.project.title',
            ])
            ->add('projectType', 'sonata_type_model', [
                'label' => 'admin.fields.project.type.title',
                'required' => false,
                'attr' => ['placeholder' => 'admin.help.project.type'],
                'choices_as_values' => true,
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.project.author',
                'property' => 'username',
            ])
            ->add('opinionTerm', 'choice', [
                'label' => 'admin.fields.project.opinion_term',
                'choices' => Project::$opinionTermsLabels,
                'translation_domain' => 'CapcoAppBundle',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('security.authorization_checker')->isGranted('ROLE_SUPER_ADMIN')) {
            $formMapper
              ->add('externalLink', null, [
                  'label' => 'admin.fields.project.externalLink',
                  'required' => false,
              ])
              ->add('participantsCount', null, [
                  'label' => 'admin.fields.project.participantsCount',
              ])
              ->add('contributionsCount', null, [
                  'label' => 'admin.fields.project.contributionsCount',
              ])
              ->add('votesCount', null, [
                  'label' => 'admin.fields.project.votesCount',
              ])
            ;
        }

        $formMapper->end()
            ->with('admin.fields.project.group_meta')
            ->add('isEnabled', null, [
                'label' => 'admin.fields.project.is_enabled',
                'required' => false,
            ])
            ->add('exportable', null, [
                'label' => 'admin.fields.project.exportable',
                'required' => false,
            ])
            ->add('publishedAt', 'sonata_type_datetime_picker', [
                'label' => 'admin.fields.project.published_at',
                'required' => true,
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper
                ->add('themes', 'sonata_type_model', [
                'label' => 'admin.fields.project.themes',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
                'choices_as_values' => true,
            ]);
        }

        $formMapper
            ->add('Cover', 'sonata_type_model_list', [
                'required' => false,
                'label' => 'admin.fields.project.cover',
            ], [
                'link_parameters' => [
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                ],
            ])
            ->add('video', null, [
                'label' => 'admin.fields.project.video',
                'required' => false,
                'help' => 'admin.help.project.video',
                ], [
                    'link_parameters' => ['context' => 'project'],
            ])
            ->end()

            // Ranking
            ->with('admin.fields.project.group_ranking')
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
                'required' => false,
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
                'required' => false,
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
                'required' => false,
            ])
            ->end()

            // Steps
            ->with('admin.fields.project.group_steps')
                ->add('steps', 'sonata_type_collection', [
                    'label' => 'admin.fields.project.steps',
                    'by_reference' => false,
                    'required' => false,
                ], [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position',
                ])
            ->end();

        $formMapper->with('admin.fields.project.advanced')
            ->add('metaDescription', null, [
                'label' => 'projects.metadescription',
                'required' => false,
                'help' => 'admin.help.metadescription',
            ])
            ->end()
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper->with('admin.fields.project.general')->end();

        $showMapper
            ->with('admin.fields.project.general')
            ->add('title', null, [
                'label' => 'admin.fields.project.title',
            ])
            ->add('isEnabled', 'boolean', [
                'label' => 'admin.fields.project.is_enabled',
            ])
            ->add('exportable', null, [
                'label' => 'admin.fields.project.exportable',
            ])
            ->add('publishedAt', null, [
                'label' => 'admin.fields.project.published_at',
            ])
            ->add('Author', null, [
                'label' => 'admin.fields.project.author',
            ])
            ->add('Cover', null, [
                'template' => 'CapcoAdminBundle:Project:cover_show_field.html.twig',
                'label' => 'admin.fields.project.cover',
            ])
            ->add('video', null, [
                'label' => 'admin.fields.project.video',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $showMapper->add('themes', null, [
                'label' => 'admin.fields.project.themes',
            ]);
        }

        $showMapper
            ->add('steps', null, [
                'label' => 'admin.fields.project.steps',
            ])
            ->add('events', null, [
                'label' => 'admin.fields.project.events',
            ])
            ->add('posts', null, [
                'label' => 'admin.fields.project.posts',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.project.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.project.updated_at',
            ])
            ->add('opinionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.opinions_threshold',
            ])
            ->add('versionsRankingThreshold', null, [
                'label' => 'admin.fields.project.ranking.versions_threshold',
            ])
            ->add('includeAuthorInRanking', null, [
                'label' => 'admin.fields.project.ranking.include_author',
            ])
            ->end()
        ;
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['batch', 'list', 'create', 'edit', 'delete']);
    }
}
