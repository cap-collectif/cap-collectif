<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Provider\MediaProvider;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Form\Type\ModelAutocompleteType;
use Sonata\AdminBundle\Form\Type\ModelListType;
use Sonata\AdminBundle\Object\Metadata;
use Sonata\AdminBundle\Object\MetadataInterface;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\DoctrineORMAdminBundle\Filter\ModelAutocompleteFilter;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class VideoAdmin extends AbstractAdmin
{
    protected ?string $classnameLabel = 'video';
    protected array $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    private MediaProvider $mediaProvider;

    public function __construct($code, $class, $baseControllerName, MediaProvider $mediaProvider)
    {
        parent::__construct($code, $class, $baseControllerName);
        $this->mediaProvider = $mediaProvider;
    }

    // For mosaic view
    public function getObjectMetadata($object): MetadataInterface
    {
        $media = $object->getMedia();
        if ($media) {
            return new Metadata(
                $object->getTitle(),
                null,
                $this->mediaProvider->generatePublicUrl(
                    $media,
                    $this->mediaProvider->getFormatName($media, 'form')
                )
            );
        }

        return parent::getObjectMetadata($object);
    }

    protected function configureDatagridFilters(DatagridMapper $filter): void
    {
        $filter
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('author', ModelAutocompleteFilter::class, [
                'field_options' => [
                    'label' => 'global.author',
                    'property' => 'email,username',
                    'to_string_callback' => function ($entity) {
                        return $entity->getEmail() . ' - ' . $entity->getUsername();
                    },
                ],
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
        ;
    }

    protected function configureListFields(ListMapper $list): void
    {
        $list
            ->addIdentifier('title', null, [
                'label' => 'global.title',
            ])
            ->add('author', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($entity) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'editable' => true,
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('_action', 'actions', [
                'label' => 'link_actions',
                'actions' => [
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    protected function configureFormFields(FormMapper $form): void
    {
        $form
            ->add('title', TextType::class, [
                'label' => 'global.title',
            ])
            ->add('body', TextareaType::class, [
                'label' => 'global.description',
            ])
            ->add('author', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($entity) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('link', null, [
                'label' => 'admin.fields.video.link',
                'required' => true,
                'help' => 'admin.help.project.video',
                'attr' => [
                    'placeholder' => 'http://',
                ],
            ])
            ->add('position', null, [
                'label' => 'global.position',
            ])
            ->add('media', ModelListType::class, [
                'label' => 'global.image',
                'required' => false,
                'help' => 'admin.help.video.media',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'required' => false,
            ])
        ;
    }

    protected function configureShowFields(ShowMapper $show): void
    {
        $show
            ->add('title', null, [
                'label' => 'global.title',
            ])
            ->add('body', null, [
                'label' => 'global.description',
            ])
            ->add('author', ModelAutocompleteType::class, [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($entity) {
                    return $entity->getEmail() . ' - ' . $entity->getUsername();
                },
            ])
            ->add('media', null, [
                'template' => '@CapcoAdmin/Event/media_show_field.html.twig',
                'label' => 'global.image',
            ])
            ->add('isEnabled', null, [
                'label' => 'global.published',
                'editable' => true,
            ])
            ->add('updatedAt', null, [
                'label' => 'global.maj',
            ])
            ->add('createdAt', null, [
                'label' => 'global.creation',
            ])
        ;
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['create', 'delete', 'list', 'edit']);
    }

    protected function configure(): void
    {
        $this->setTemplate('edit', '@CapcoAdmin/CRUD/edit.html.twig');
    }
}
