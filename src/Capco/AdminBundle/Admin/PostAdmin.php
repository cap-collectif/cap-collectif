<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Filter\KnpTranslationFieldFilter;
use Capco\AppBundle\Toggle\Manager;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Form\Type\ModelType;
use Sonata\AdminBundle\Object\MetadataInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\BlockBundle\Meta\Metadata;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Sonata\Form\Type\CollectionType;
use Sonata\Form\Type\DateTimePickerType;
use Sonata\MediaBundle\Form\Type\MediaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Sonata\AdminBundle\Admin\AbstractAdmin;

class PostAdmin extends AbstractAdmin
{
    protected $classnameLabel = 'post';
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'createdAt'];
    private $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
    }

    /** @var Post */
    public function getObjectMetadata($object): MetadataInterface
    {
        $media = $object->getMedia();
        if ($media) {
            $provider = $this->getConfigurationPool()
                ->getContainer()
                ->get($media->getProviderName());
            $format = $provider->getFormatName($media, 'form');
            $url = $provider->generatePublicUrl($media, $format);

            return new Metadata($object->getTitle(), $object->getBody(), $url);
        }

        return parent::getObjectMetadata($object);
    }

    public function getFeatures()
    {
        return ['blog'];
    }

    /** @var Post */
    public function onPostPersist($object)
    {
        if ($object->getProposals()->count() > 0) {
            foreach ($object->getProposals() as $proposal) {
                $this->getContainer()
                    ->get('capco.proposal_notifier')
                    ->onOfficialAnswer($proposal, $object);
            }
        }
    }

    public function getTemplate($name)
    {
        if ('create' === $name) {
            return 'CapcoAdminBundle:Post:create.html.twig';
        }
        if ('edit' === $name) {
            return 'CapcoAdminBundle:Post:edit.html.twig';
        }

        return parent::getTemplate($name);
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper): void
    {
        $datagridMapper->add('title', KnpTranslationFieldFilter::class, [
            'label' => 'global.title',
        ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $datagridMapper->add('themes', null, ['label' => 'admin.fields.blog_post.themes']);
        }

        $datagridMapper
            ->add(
                'proposals',
                ModelAutocompleteFilter::class,
                ['label' => 'admin.fields.blog_post.proposals'],
                null,
                ['property' => 'title']
            )
            ->add('projects', null, ['label' => 'admin.fields.blog_post.projects'])
            ->add('body', KnpTranslationFieldFilter::class, ['label' => 'global.contenu'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('isPublished', null, ['label' => 'global.published'])
            ->add('commentable', null, ['label' => 'admin.fields.blog_post.is_commentable'])
            ->add('publishedAt', null, ['label' => 'global.updated.date'])
            ->add('updatedAt', null, ['label' => 'global.title'])
            ->add(
                'Authors',
                ModelAutocompleteFilter::class,
                ['label' => 'admin.fields.blog_post.authors'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity, $property) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ]
            );
    }

    protected function configureListFields(ListMapper $listMapper): void
    {
        $listMapper
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('Authors', CollectionType::class, [
                'label' => 'admin.fields.blog_post.authors',
            ]);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $listMapper->add('themes', null, ['label' => 'admin.fields.blog_post.themes']);
        }

        $listMapper
            ->add('projects', null, ['label' => 'admin.fields.blog_post.projects'])
            ->add('createdAt', null, ['label' => 'global.creation'])
            ->add('isPublished', null, [
                'editable' => true,
                'label' => 'global.published',
            ])
            ->add('publishedAt', null, ['label' => 'global.updated.date'])
            ->add('commentable', null, [
                'label' => 'admin.fields.blog_post.is_commentable',
                'editable' => true,
            ])
            ->add('commentsCount', null, ['label' => 'admin.fields.blog_post.comments_count'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ]);
    }

    protected function configureFormFields(FormMapper $formMapper): void
    {
        $editMode = $this->getSubject()->getId() ? true : false;

        $formMapper->with('global.contenu')->add('title', TextType::class, [
            'label' => 'global.title',
            'required' => true,
        ]);
        if ($editMode) {
            $formMapper->add('slug', TextType::class, [
                'disabled' => true,
                'attr' => ['readonly' => true],
                'label' => 'global.link',
            ]);
        }
        $formMapper
            ->add('Authors', ModelAutocompleteType::class, [
                'label' => 'admin.fields.blog_post.authors',
                'property' => 'username,email',
                'to_string_callback' => function ($entity, $property) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
                'multiple' => true,
                'required' => false,
            ])
            ->add('abstract', TextType::class, ['label' => 'global.summary', 'required' => false])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add(
                'media',
                ModelListType::class,
                [
                    'required' => false,
                    'label' => 'global.illustration',
                ],
                [
                    'link_parameters' => [
                        'context' => 'default',
                        'hide_context' => true,
                        'provider' => 'sonata.media.provider.image',
                    ],
                ]
            )
            ->end();
        $formMapper
            ->with('admin.fields.page.advanced')
            ->add('metaDescription', TextType::class, [
                'label' => 'global.meta.description',
                'required' => false,
                'help' => 'admin.help.metadescription',
            ])
            ->add('customCode', null, [
                'label' => 'admin.customcode',
                'required' => false,
                'help' => 'admin.help.customcode',
                'attr' => [
                    'rows' => 10,
                    'placeholder' => '<script type="text/javascript"> </script>',
                ],
            ])
            ->end();

        $formMapper->end()->with('admin.fields.blog_post.group_linked_content');

        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $formMapper->add('themes', ModelType::class, [
                'label' => 'admin.fields.blog_post.themes',
                'required' => false,
                'multiple' => true,
                'btn_add' => false,
                'by_reference' => false,
            ]);
        }

        $formMapper
            ->add('projects', ModelType::class, [
                'label' => 'admin.fields.blog_post.projects',
                'required' => false,
                'multiple' => true,
                'btn_add' => false,
                'by_reference' => false,
            ])
            ->add('proposals', ModelAutocompleteType::class, [
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
            ]);
        $formMapper
            ->end()
            ->with('admin.fields.blog_post.group_meta')
            ->add('publishedAt', DateTimePickerType::class, [
                'required' => true,
                'label' => 'global.updated.date',
                'format' => 'dd/MM/yyyy HH:mm',
                'attr' => ['data-date-format' => 'DD/MM/YYYY HH:mm'],
            ])
            ->add('isPublished', null, [
                'label' => 'global.published',
                'required' => false,
            ])
            ->add('commentable', null, [
                'label' => 'admin.fields.blog_post.is_commentable',
                'required' => false,
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper): void
    {
        $showMapper
            ->add('title', null, ['label' => 'global.title'])
            ->add('authors', null, ['label' => 'admin.fields.blog_post.authors']);
        if (
            $this->getConfigurationPool()
                ->getContainer()
                ->get(Manager::class)
                ->isActive('themes')
        ) {
            $showMapper->add('themes', null, ['label' => 'admin.fields.blog_post.themes']);
        }

        $showMapper
            ->add('projects', null, ['label' => 'admin.fields.blog_post.projects'])
            ->add('abstract', null, ['label' => 'global.summary'])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add('media', MediaType::class, [
                'template' => 'CapcoAdminBundle:Post:media_show_field.html.twig',
                'provider' => 'sonata.media.provider.image',
                'label' => 'admin.fields.blog_post.media',
            ])
            ->add('isPublished', null, ['label' => 'global.published'])
            ->add('publishedAt', null, ['label' => 'global.updated.date'])
            ->add('commentable', null, ['label' => 'admin.fields.blog_post.is_commentable'])
            ->add('commentsCount', null, ['label' => 'admin.fields.blog_post.comments_count'])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('createdAt', null, ['label' => 'global.creation']);
    }
}
