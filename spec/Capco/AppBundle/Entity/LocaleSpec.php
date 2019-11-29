<?php

namespace spec\Capco\AppBundle\Entity;

use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Exception\LocaleConfigurationException;
use PhpSpec\ObjectBehavior;

class LocaleSpec extends ObjectBehavior
{
    public function let()
    {
        $this->beConstructedWith('fr-FR', 'locale.fr');
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(Locale::class);
        $this->getCode()->shouldBe('fr-FR');
        $this->getTraductionKey()->shouldBe('locale.fr');
        $this->isEnabled()->shouldBe(false);
        $this->isPublished()->shouldBe(false);
        $this->isDefault()->shouldBe(false);
    }

    public function it_can_publish_only_if_enabled()
    {
        $this->shouldThrow(LocaleConfigurationException::class)->during('publish');

        $this->enable();
        $this->publish();
        $this->isPublished()->shouldBe(true);
    }

    public function it_can_disable_only_if_not_published()
    {
        $this->enable();
        $this->publish();

        $this->shouldThrow(LocaleConfigurationException::class)->during('disable');

        $this->unpublish();
        $this->disable();
        $this->isEnabled()->shouldBe(false);
    }

    public function it_can_set_default_only_if_published()
    {
        $this->enable();
        $this->unpublish();

        $this->shouldThrow(LocaleConfigurationException::class)->during('setDefault');

        $this->publish();
        $this->setDefault();
        $this->isDefault()->shouldBe(true);
    }
}
