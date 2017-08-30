<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
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

    // For mosaic view
    public function getObjectMetadata($object)
    {
        $media = $object->getMedia();
        if ($media) {
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

    public function onPostPersist($object)
    {
        if ($object->getProposals()->count() > 0) {
            foreach ($object->getProposals() as $proposal) {
                $this->getContainer()->get('notifier')->notifyProposalPost($proposal, $object);
            }
        }
    }

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
            ->add('proposals', 'doctrine_orm_model_autocomplete', [
              'label' => 'admin.fields.blog_post.proposals',
            ], null, ['property' => 'title'])
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
            ],
            null,
            [
                'property' => 'username',
            ])
        ;
    }

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

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
          ->with('admin.fields.blog_post.group_content', ['class' => 'col-md-12'])->end()
          ->with('admin.fields.blog_post.group_linked_content', ['class' => 'col-md-6'])->end()
          ->with('admin.fields.blog_post.group_meta', ['class' => 'col-md-6'])->end()
      ;

        $formMapper
            ->with('admin.fields.blog_post.group_content')
            ->add('title', null, [
                'label' => 'admin.fields.blog_post.title',
            ])
            ->add('Authors', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.blog_post.authors',
                'property' => 'username',
                'multiple' => true,
                'required' => false,
            ])
            ->add('abstract', null, [
                'label' => 'admin.fields.blog_post.abstract',
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'admin.fields.blog_post.body',
                'config_name' => 'admin_editor',
            ])
            ->add('Media', 'sonata_type_model_list', ['required' => false], [
                'link_parameters' => [
                    'context' => 'default',
                    'hide_context' => true,
                ],
            ])
        ;

        $formMapper
            ->end()
            ->with('admin.fields.blog_post.group_linked_content');

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper
              ->add('themes', 'sonata_type_model', [
                'label' => 'admin.fields.blog_post.themes',
                'required' => false,
                'multiple' => true,
                'btn_add' => false,
                'by_reference' => false,
            ]);
        }

        $formMapper
            ->add('projects', 'sonata_type_model', [
                'label' => 'admin.fields.blog_post.projects',
                'required' => false,
                'multiple' => true,
                'btn_add' => false,
                'by_reference' => false,
            ])
            ->add('proposals', 'sonata_type_model_autocomplete', [
              'property' => 'title',
              'label' => 'admin.fields.blog_post.proposals',
              'help' => 'L\'auteur de la proposition sera notifié d\'un nouvel article',
              'required' => false,
              'multiple' => true,
              'by_reference' => false,
            ])
            ->add('displayedOnBlog', null, [
              'label' => 'admin.fields.blog_post.displayedOnBlog',
              'required' => false,
            ])
      ;

        $formMapper
          ->end()
          ->with('admin.fields.blog_post.group_meta')
            ->add('publishedAt', 'sonata_type_datetime_picker', [
                'required' => true,
                'label' => 'admin.fields.blog_post.published_at',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => [
                    'data-date-format' => 'DD/MM/YYYY HH:mm',
                ],
            ])
            ->add('isPublished', null, [
                'label' => 'admin.fields.blog_post.is_published',
                'required' => false,
            ])
            ->add('isCommentable', null, [
                'label' => 'admin.fields.blog_post.is_commentable',
                'required' => false,
            ])
        ;
    }

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
            ->add('body', CKEditorType::class, [
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
}
