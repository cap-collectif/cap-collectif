<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\CoreBundle\Model\Metadata;

class PostAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'createdAt',
    ];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.blog_post.title',
            ])
        ;
        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $datagridMapper->add('themes', null, [
                    'label' => 'admin.fields.blog_post.themes',
                ]);
        }

        $datagridMapper
            ->add('projects', null, [
                'label' => 'admin.fields.blog_post.projects',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.blog_post.body',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.blog_post.created_at',
            ])
            ->add('isPublished', null, [
                'label' => 'admin.fields.blog_post.is_published',
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.blog_post.is_commentable',
            ])
            ->add('publishedAt', null, [
                'label' => 'admin.fields.blog_post.published_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.blog_post.title',
            ])
            ->add('Authors', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.blog_post.authors',
            ], null, [
                'property' => 'username',
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
                'label' => 'admin.fields.blog_post.title',
            ])
            ->add('Authors', 'sonata_type_collection', [
                'label' => 'admin.fields.blog_post.authors',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $listMapper->add('themes', null, [
                'label' => 'admin.fields.blog_post.themes',
            ]);
        }

        $listMapper
            ->add('projects', null, [
                'label' => 'admin.fields.blog_post.projects',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.blog_post.created_at',
            ])
            ->add('isPublished', null, [
                'editable' => true,
                'label' => 'admin.fields.blog_post.is_published',
            ])
            ->add('publishedAt', null, [
                'label' => 'admin.fields.blog_post.published_at',
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.blog_post.is_commentable',
                'editable' => true,
            ])
            ->add('commentsCount', null, [
                'label' => 'admin.fields.blog_post.comments_count',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.blog_post.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
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
                'label' => 'admin.fields.blog_post.title',
            ])
            ->add('Authors', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.blog_post.authors',
                'property' => 'username',
                'multiple' => true,
                'required' => false,
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper->add('themes', 'sonata_type_model', [
                'label' => 'admin.fields.blog_post.themes',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
            ]);
        }

        $formMapper
            ->add('projects', 'sonata_type_model', [
                'label' => 'admin.fields.blog_post.projects',
                'required' => false,
                'multiple' => true,
                'by_reference' => false,
            ])
            ->add('isPublished', null, [
                'label' => 'admin.fields.blog_post.is_published',
                'required' => false,
            ])
            ->add('publishedAt', 'sonata_type_datetime_picker', [
                'required' => false,
                'label' => 'admin.fields.blog_post.published_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
            ])
            ->add('abstract', null, [
                'label' => 'admin.fields.blog_post.abstract',
            ])
            ->add('body', 'ckeditor', [
                'label' => 'admin.fields.blog_post.body',
                'config_name' => 'admin_editor',
            ])
            ->add('Media', 'sonata_type_model_list', ['required' => false], [
                'link_parameters' => [
                    'context' => 'default',
                    'hide_context' => true,
                ],
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.blog_post.is_commentable',
                'required' => false,
            ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.blog_post.title',
            ])
            ->add('Authors', null, [
                'label' => 'admin.fields.blog_post.authors',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $showMapper->add('themes', null, [
                'label' => 'admin.fields.blog_post.themes',
            ]);
        }

        $showMapper
            ->add('projects', null, [
                'label' => 'admin.fields.blog_post.projects',
            ])
            ->add('abstract', null, [
                'label' => 'admin.fields.blog_post.abstract',
            ])
            ->add('body', 'ckeditor', [
                'label' => 'admin.fields.blog_post.body',
                'config_name' => 'admin_editor',
            ])
            ->add('Media', 'sonata_media_type', [
                'template' => 'CapcoAdminBundle:Post:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.blog_post.media',
            ])
            ->add('isPublished', null, [
                'label' => 'admin.fields.blog_post.is_published',
            ])
            ->add('publishedAt', null, [
                'label' => 'admin.fields.blog_post.published_at',
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.blog_post.is_commentable',
            ])
            ->add('commentsCount', null, [
                'label' => 'admin.fields.blog_post.comments_count',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.blog_post.updated_at',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.blog_post.created_at',
            ])
        ;
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
            'blog',
        ];
    }
}
