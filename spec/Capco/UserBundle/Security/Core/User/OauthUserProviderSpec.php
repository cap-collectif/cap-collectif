<?php

namespace spec\Capco\UserBundle\Security\Core\User;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\SSO\FranceConnectSSOConfiguration;
use Capco\AppBundle\GraphQL\Mutation\GroupMutation;
use Capco\AppBundle\Repository\FranceConnectSSOConfigurationRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\FranceConnect\FranceConnectMapper;
use Capco\UserBundle\FranceConnect\FranceConnectResourceOwner;
use Capco\UserBundle\MonCompteParis\OpenAmClient;
use Capco\UserBundle\OpenID\OpenIDExtraMapper;
use Capco\UserBundle\Repository\UserRepository;
use Capco\UserBundle\Security\Core\User\MonCompteParisUserProvider;
use Capco\UserBundle\Security\Core\User\OauthUserProvider;
use FOS\UserBundle\Model\UserManagerInterface;
use HWI\Bundle\OAuthBundle\OAuth\Response\UserResponseInterface;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;

class OauthUserProviderSpec extends ObjectBehavior
{
    public function it_is_initializable(): void
    {
        $this->shouldHaveType(OauthUserProvider::class);
    }

    public function let(
        UserManagerInterface $userManager,
        UserRepository $userRepository,
        OpenIDExtraMapper $extraMapper,
        Indexer $indexer,
        GroupMutation $groupMutation,
        FranceConnectSSOConfigurationRepository $franceConnectSSOConfigurationRepository
    ) {
        $this->beConstructedWith($userManager, $userRepository, $extraMapper, $indexer, [], $groupMutation, $franceConnectSSOConfigurationRepository);
    }

    public function it_map(
        UserResponseInterface $response,
        User $user
    ) {
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['email'] = 'toto@alapla.ge';
        $response->getData()->willReturn($data);
        $user->setFirstname(ucfirst(strtolower($data['given_name'])))->shouldBeCalled();
        $user->setUsername('ala Toto')->shouldBeCalled();
        $user->setLastname($data['family_name'])->shouldBeCalled();
        $user->setGender('m')->shouldBeCalled();
        $user->setEmail($data['email'])->shouldBeCalled();
        $birthday = \DateTime::createFromFormat('Y-m-d', $data['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }
        $user->setDateOfBirth($birthday)->shouldBeCalled();
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => false,
        ];

        $this->map($user->getWrappedObject(), $response->getWrappedObject(), $allowedData)->shouldReturn($user);
    }

    public function it_map_with_username(
        UserResponseInterface $response,
        User $user
    ) {
        $data = [];
        $data['given_name'] = 'toto';
        $data['family_name'] = 'ala';
        $data['birthplace'] = false;
        $data['birthdate'] = '1992-12-12';
        $data['gender'] = 'male';
        $data['preferred_username'] = 'toto_fc_username';
        $data['email'] = 'toto@alapla.ge';
        $response->getData()->willReturn($data);
        $user->setFirstname(ucfirst(strtolower($data['given_name'])))->shouldBeCalled();
        $user->setUsername('toto_fc_username')->shouldBeCalled();
        $user->setLastname($data['family_name'])->shouldBeCalled();
        $user->setGender('m')->shouldBeCalled();
        $user->setEmail($data['email'])->shouldBeCalled();
        $birthday = \DateTime::createFromFormat('Y-m-d', $data['birthdate']) ?: null;
        if ($birthday) {
            $birthday->setTime(0, 0);
        }

        $user->setDateOfBirth($birthday)->shouldBeCalled();
        $allowedData = [
            'given_name' => true,
            'family_name' => true,
            'birthdate' => true,
            'gender' => true,
            'birthplace' => false,
            'birthcountry' => false,
            'email' => true,
            'preferred_username' => true,
        ];

        $this->map($user->getWrappedObject(), $response->getWrappedObject(), $allowedData)->shouldReturn($user);
    }

}
