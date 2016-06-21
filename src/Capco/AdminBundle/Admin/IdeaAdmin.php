<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;
use Sonata\AdminBundle\Route\RouteCollection;

class IdeaAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.idea.title',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $datagridMapper->add('theme', null, [
                'label' => 'admin.fields.idea.theme',
            ]);
        }

        $datagridMapper
            ->add('votesCount', null, [
                'label' => 'admin.fields.idea.vote_count',
            ])
            ->add('Author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.idea.author',
            ], null, [
                'property' => 'username',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.idea.is_enabled',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.idea.is_trashed',
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.idea.is_commentable',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.idea.updated_at',
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
                'label' => 'admin.fields.idea.title',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $listMapper->add('theme', null, [
                'label' => 'admin.fields.idea.theme',
            ]);
        }

        $listMapper
            ->add('votesCount', null, [
                'label' => 'admin.fields.idea.vote_count',
            ])
            ->add('commentsCount', null, [
                'label' => 'admin.fields.idea.comments_count',
            ])
            ->add('Author', 'sonata_type_model', [
                'label' => 'admin.fields.idea.author',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.idea.is_enabled',
                'editable' => true,
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.idea.is_trashed',
                'editable' => true,
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.idea.is_commentable',
                'editable' => true,
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.idea.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                    'export_voters' => ['template' => 'CapcoAdminBundle:CRUD:list__action_export_voters.html.twig'],
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
            ->add('title', null, [
                'label' => 'admin.fields.idea.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.idea.is_enabled',
                'required' => false,
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.idea.is_commentable',
                'required' => false,
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.idea.author',
                'property' => 'username',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper->add('theme', 'sonata_type_model', [
                'label' => 'admin.fields.idea.theme',
                'required' => true,
            ]);
        }

        $formMapper
            ->add('object', 'ckeditor', [
                'label' => 'admin.fields.idea.object',
                'config_name' => 'admin_editor',
            ])
            ->add('body', 'ckeditor', [
                'label' => 'admin.fields.idea.body',
                'config_name' => 'admin_editor',
            ])
            ->add('media', 'sonata_type_model_list', [
                'label' => 'admin.fields.idea.media',
                'required' => false,
            ], [
                'link_parameters' => [
                    'context' => 'default',
                    'hide_context' => true,
                    'provider' => 'sonata.media.provider.image',
                ],
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.idea.is_trashed',
                'required' => false,
            ])
            ->add('trashedReason', null, [
                'label' => 'admin.fields.idea.trashed_reason',
                'required' => false,
            ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.idea.title',
            ])
            ->add('object', null, [
                'label' => 'admin.fields.idea.object',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.idea.body',
            ]);

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $showMapper->add('theme', null, [
                'label' => 'admin.fields.idea.theme',
            ]);
        }

        $showMapper
            ->add('votesCount', null, [
                'label' => 'admin.fields.idea.vote_count',
            ])
            ->add('Author', null, [
                'label' => 'admin.fields.idea.author',
            ])
            ->add('media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:Idea:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.idea.media',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.idea.is_enabled',
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.idea.is_commentable',
            ])
            ->add('commentsCount', null, [
                'label' => 'admin.fields.idea.comments_count',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.idea.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.idea.created_at',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.idea.is_trashed',
            ])
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, [
                    'label' => 'admin.fields.idea.trashed_at',
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.idea.trashed_reason',
                ])
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->add('export_voters', $this->getRouterIdParameter().'/export_voters');
    }

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media != null) {
            $provider = $this->getConfigurationPool()->getContainer()->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getTitle(), $object->getBody(), $url);
        }

        return parent::getObjectMetadata($object);
    }

    public function getFeatures()
    {
        return [
            'ideas',
        ];
    }
}
